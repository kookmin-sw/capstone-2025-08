package site.pathos.domain.project.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.project.dto.request.CreateProjectRequestDto;
import site.pathos.domain.project.dto.response.GetProjectsResponseDto;
import site.pathos.domain.project.dto.response.GetProjectsResponseDto.GetProjectsResponseModelsDto;
import site.pathos.domain.project.dto.response.ProjectDetailDto;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.enums.ProjectSortType;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.subProject.dto.request.SubProjectTilingRequestDto;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.domain.userModel.repository.UserModelRepository;
import site.pathos.global.aws.ec2.Ec2Service;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.aws.s3.dto.S3UploadFileDto;
import site.pathos.global.common.PaginationResponse;
import site.pathos.global.util.datetime.DateTimeUtils;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final SubProjectRepository subProjectRepository;
    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final ModelRepository modelRepository;
    private final UserModelRepository userModelRepository;
    private static final int PROJECTS_PAGE_SIZE = 9;

    private final Ec2Service ec2Service;

    public ProjectDetailDto getProjectDetail(Long projectId){
        List<SubProjectSummaryDto> subProjects = subProjectRepository.findSubProjectIdAndThumbnailByProjectId(projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found: id = " + projectId));

        return new ProjectDetailDto(
                projectId,
                project.getTitle(),
                subProjects
        );
    }

    @Transactional
    public void createProject(CreateProjectRequestDto requestDto, List<MultipartFile> files) {
        User user = userRepository.findById(1L) //TODO
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
        Model model = modelRepository.findById(requestDto.modelId())
                .orElseThrow(() -> new IllegalArgumentException("model not found"));

        Project project = Project.builder()
                .user(user)
                .title(requestDto.title())
                .description(requestDto.description())
                .modelType(model.getModelType())
                .build();
        projectRepository.save(project);

        List<S3UploadFileDto> uploadFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            SubProject subProject = SubProject.builder()
                    .project(project)
                    .build();
            subProjectRepository.save(subProject);
            String svsKey = subProject.initializeSvsImageUrl();
            uploadFiles.add(new S3UploadFileDto(subProject.getId(), svsKey, file));

            AnnotationHistory annotationHistory = AnnotationHistory.builder()
                    .subProject(subProject)
                    .model(model)
                    .modelName(model.getName())
                    .build();
            annotationHistoryRepository.save(annotationHistory);
        }

        s3Service.uploadFilesAsync(uploadFiles, uploadImages -> {
            for (SubProjectTilingRequestDto image : uploadImages) {
                ec2Service.asyncLaunchTilingInstance(image);
            }
        });
    }

    @Transactional(readOnly = true)
    public GetProjectsResponseDto getProjects(String search, ProjectSortType sort, int page) {
        List<GetProjectsResponseModelsDto> userModels = getModels();

        Page<Project> projectPage = getProjectPage(search, sort, page);
        List<GetProjectsResponseDto.GetProjectsResponseDetailDto> projects = getProjectDetails(projectPage);
        PaginationResponse<GetProjectsResponseDto.GetProjectsResponseDetailDto> projectPages = new PaginationResponse<>(
                projects,
                PROJECTS_PAGE_SIZE,
                projectPage.getNumber() + 1,
                projectPage.getTotalPages(),
                projectPage.getTotalElements()
        );

        return new GetProjectsResponseDto(
                projectPages,
                userModels
        );
    }

    private List<GetProjectsResponseModelsDto> getModels() {
        List<Model> models = userModelRepository.findAllModelsByUserId(1L);

        return models
                .stream()
                .map(model -> new GetProjectsResponseModelsDto(model.getId(), model.getModelType(), model.getName()))
                .toList();
    }

    private Page<Project> getProjectPage(String search, ProjectSortType sort, int page) {
        Pageable pageable = PageRequest.of(page - 1, PROJECTS_PAGE_SIZE, sort.getSort());

        Page<Project> projectPage;
        if (search != null && !search.isBlank()) {
            projectPage = projectRepository.findByTitleContainingIgnoreCaseOrderByUpdatedAtDesc(search, pageable);
        } else {
            projectPage = projectRepository.findAllByOrderByUpdatedAtDesc(pageable);
        }
        return projectPage;
    }

    private List<GetProjectsResponseDto.GetProjectsResponseDetailDto> getProjectDetails(Page<Project> projectPage) {
        prefetchProjectRelations(projectPage);

        List<GetProjectsResponseDto.GetProjectsResponseDetailDto> projectDetails = new ArrayList<>();

        for (Project project : projectPage.getContent()) {
            List<SubProject> subProjects = project.getSubProjects();

            if (subProjects == null || subProjects.isEmpty()) {
                continue;
            }

            String modelName = subProjects.get(subProjects.size() - 1).getAnnotationHistories().stream()
                    .max(Comparator.comparing(AnnotationHistory::getStartedAt))
                    .map(AnnotationHistory::getModel)
                    .map(Model::getName)
                    .orElse("");

            List<String> thumbnailUrls = subProjects.stream()
                    .map(SubProject::getThumbnailUrl)
                    .filter(url -> url != null && !url.isBlank())
                    .limit(4)
                    .toList();

            projectDetails.add(new GetProjectsResponseDto.GetProjectsResponseDetailDto(
                    project.getId(),
                    project.getTitle(),
                    DateTimeUtils.dateTimeToStringFormat(project.getCreatedAt()),
                    DateTimeUtils.dateTimeToStringFormat(project.getUpdatedAt()),
                    project.getModelType(),
                    modelName,
                    thumbnailUrls
            ));
        }
        return projectDetails;
    }

    /**
     * 프로젝트와 그 하위 엔티티들(SubProject, AnnotationHistory, Model)을 미리 fetch하여
     * N+1 문제를 방지하고, MultipleBagFetchException을 피하기 위해 쿼리를 분리해 실행합니다.
     */
    private void prefetchProjectRelations(Page<Project> projectPage) {
        List<Long> projectIds = projectPage.getContent().stream().map(Project::getId).toList();

        List<Project> fetchedProjects = projectRepository.fetchProjectsWithSubProjectsByIds(projectIds);

        List<SubProject> subProjects = fetchedProjects.stream()
                .flatMap(p -> p.getSubProjects().stream())
                .toList();

        subProjectRepository.fetchWithAnnotationHistoriesAndModels(subProjects);
    }
}

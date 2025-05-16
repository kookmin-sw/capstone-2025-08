package site.pathos.domain.project.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.entity.AnnotationHistory;
import site.pathos.domain.annotation.repository.AnnotationHistoryRepository;
import site.pathos.domain.project.entity.ProjectLabel;
import site.pathos.domain.annotation.repository.ProjectLabelRepository;
import site.pathos.domain.model.repository.ModelRepository;
import site.pathos.domain.model.repository.ProjectModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.enums.ModelType;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.project.dto.request.CreateProjectRequestDto;
import site.pathos.domain.project.dto.request.UpdateProjectRequestDto;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto.AnalyticsDto;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto.LabelDto;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto.ModelProcessDto;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto.SlideDto;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto.SlideSummaryDto;
import site.pathos.domain.project.dto.response.GetProjectsResponseDto;
import site.pathos.domain.project.dto.response.GetProjectsResponseDto.GetProjectsResponseModelsDto;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.enums.ModelProcessStatusType;
import site.pathos.domain.project.enums.ProjectSortType;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.project.dto.request.SubProjectTilingRequestDto;
import site.pathos.domain.project.entity.SubProject;
import site.pathos.domain.project.repository.SubProjectRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.domain.model.repository.UserModelRepository;
import site.pathos.global.aws.ec2.Ec2Service;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.aws.s3.dto.S3UploadFileDto;
import site.pathos.global.common.PaginationResponse;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
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
    private final Ec2Service ec2Service;
    private static final int PROJECTS_PAGE_SIZE = 9;
    private final ProjectModelRepository projectModelRepository;
    private final ProjectLabelRepository projectLabelRepository;

    @Transactional
    public void createProject(CreateProjectRequestDto requestDto, List<MultipartFile> files) {
        User user = userRepository.findById(1L) //TODO
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Model model;
        if (requestDto.modelId() == null) {
            if (requestDto.modelType() == ModelType.TISSUE) {
                model = modelRepository.findFirstByTrainingHistoryIsNullAndModelTypeAndTissueModelPathIsNotNullAndCellModelPathIsNullOrderByTrainedAtDesc(ModelType.TISSUE)
                        .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
            } else if (requestDto.modelType() == ModelType.CELL) {
                model = modelRepository.findFirstByTrainingHistoryIsNullAndModelTypeAndCellModelPathIsNotNullAndTissueModelPathIsNullOrderByTrainedAtDesc(ModelType.CELL)
                        .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
            } else if (requestDto.modelType() == ModelType.MULTI) {
                model = modelRepository.findFirstByTrainingHistoryIsNullAndModelTypeAndCellModelPathIsNotNullAndTissueModelPathIsNotNullOrderByTrainedAtDesc(ModelType.MULTI)
                        .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
            } else {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR); // 잘못된 modelType 처리
            }
        } else {
            model = modelRepository.findById(requestDto.modelId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
        }

        Project project = Project.builder()
                .user(user)
                .title(requestDto.title())
                .description(requestDto.description())
                .modelType(requestDto.modelType())
                .build();
        projectRepository.save(project);

        ProjectModel projectModel = ProjectModel.builder()
                .name(model.getName())
                .project(project)
                .model(model)
                .isInitial(true)
                .build();
        projectModelRepository.save(projectModel);

        List<S3UploadFileDto> uploadFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            SubProject subProject = SubProject.builder()
                    .project(project)
                    .build();
            subProjectRepository.save(subProject);
            String svsKey = subProject.initializeSvsImagePath();
            subProject.initializeThumbnailImagePath();
            subProject.initializeTileImagePath();
            uploadFiles.add(new S3UploadFileDto(subProject.getId(), svsKey, file));

            AnnotationHistory annotationHistory = AnnotationHistory.builder()
                    .subProject(subProject)
                    .build();
            annotationHistoryRepository.save(annotationHistory);
        }
        s3Service.uploadSvsFilesAsync(uploadFiles, uploadImages -> {
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
            projectPage = projectRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            projectPage = projectRepository.findAll(pageable);
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

            Model model = projectModelRepository.findLatestByProjectIdWithModel(project.getId())
                    .stream()
                    .findFirst()
                    .map(ProjectModel::getModel)
                    .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_MODEL_NOT_FOUND));

            List<String> thumbnailUrls = subProjects.stream()
                    .map(SubProject::getThumbnailPath)
                    .filter(url -> url != null && !url.isBlank())
                    .map(s3Service::getPresignedUrl)
                    .limit(4)
                    .toList();

            projectDetails.add(new GetProjectsResponseDto.GetProjectsResponseDetailDto(
                    project.getId(),
                    project.getTitle(),
                    project.getDescription(),
                    DateTimeUtils.dateTimeToStringFormat(project.getCreatedAt()),
                    DateTimeUtils.dateTimeToStringFormat(project.getUpdatedAt()),
                    project.getModelType(),
                    model.getName(),
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
        List<Long> projectIds = projectPage.getContent().stream()
                .map(Project::getId)
                .toList();

        List<Project> fetchedProjects = projectRepository.fetchProjectsWithSubProjectsByIds(projectIds);

        // 서브프로젝트의 어노테이션 히스토리 및 모델까지 미리 로딩
        List<SubProject> subProjects = fetchedProjects.stream()
                .flatMap(p -> p.getSubProjects().stream())
                .toList();

        subProjectRepository.fetchWithAnnotationHistories(subProjects);
    }

    @Transactional
    public void updateProject(Long projectId, UpdateProjectRequestDto requestDto) {
        Long userId = 1L;   // TODO
        Project project = getProject(projectId, userId);

        project.updateDetail(requestDto.title(), requestDto.description());
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Long userId = 1L;   // TODO
        Project project = getProject(projectId, userId);

        project.delete();
    }

    @Transactional(readOnly = true)
    public GetProjectDetailResponseDto getProjectDetail(Long projectId) {
        Long userId = 1L;   // TODO
        Project project = getProject(projectId, userId);

        List<SubProject> subProjects = getSubProjects(project);
        Model recentModel = getRecentModel(project);
        String createdAt = DateTimeUtils.dateTimeToStringFormat(project.getCreatedAt());
        String updatedAt = DateTimeUtils.dateTimeToStringFormat(project.getUpdatedAt());
        SlideSummaryDto slideSummaryDto = getSlideSummaryDto(subProjects);
        ModelProcessDto modelProcessDto = getModelProcessDto();
        List<LabelDto> labels = getLabelDtos(projectId);
        List<SlideDto> slides = getSlideDtos(subProjects);
        AnalyticsDto analytics = getAnalyticsDto();

        return new GetProjectDetailResponseDto(
                projectId,
                project.getTitle(),
                project.getDescription(),
                project.getModelType(),
                recentModel.getName(),
                createdAt,
                updatedAt,
                slideSummaryDto,
                modelProcessDto,
                labels,
                slides,
                analytics
        );
    }

    private Project getProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_PROJECT_ACCESS);
        }

        return project;
    }

    private List<SubProject> getSubProjects(Project project) {
        List<SubProject> subProjects = subProjectRepository.findSubProjectsByProject(project);
        List<AnnotationHistory> annotationHistories = subProjects.stream()
                .flatMap(sp -> sp.getAnnotationHistories().stream())
                .toList();
        if (!annotationHistories.isEmpty()) {
            annotationHistoryRepository.fetchAnnotationHistories(annotationHistories);
        }
        return subProjects;
    }

    private Model getRecentModel(Project project) {
        return projectModelRepository.findLatestByProjectIdWithModel(project.getId())
                .map(ProjectModel::getModel)
                .orElse(null); // 혹은 orElseThrow(...)로 바꿔도 됨
    }

    private List<LabelDto> getLabelDtos(Long projectId) {
        List<ProjectLabel> projectLabels = projectLabelRepository.findAllByProjectId(projectId);

        return projectLabels.stream()
                .map(pl -> new LabelDto(
                        pl.getName(),
                        pl.getColor()
                ))
                .toList();
    }

    private SlideSummaryDto getSlideSummaryDto(List<SubProject> subProjects) {
        int total = subProjects.size();
        int completed = (int) subProjects.stream()
                .filter(SubProject::isUploadComplete)
                .count();

        int uploadProgress = total == 0 ? 0 : (int) ((completed * 100.0) / total);

        String lastUploadedTime = subProjects.stream()
                .filter(SubProject::isUploadComplete)
                .map(SubProject::getUpdatedAt)
                .max(LocalDateTime::compareTo)
                .map(time -> time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a")))
                .orElse("");

        return new SlideSummaryDto(
                total,
                uploadProgress,
                lastUploadedTime
        );
    }

    private ModelProcessDto getModelProcessDto() {
        // TODO: 모델 학습 및 추론 진행률 필요
        return new ModelProcessDto(
                ModelProcessStatusType.PROGRESS.getName(),
                0,
                0,
                0,
                ""
        );
    }

    private List<SlideDto> getSlideDtos(List<SubProject> subProjects) {
        return subProjects.stream()
                .map(subProject -> {
                    String thumbnailPath = subProject.getThumbnailPath();
                    String thumbnailUrl = "";

                    if (thumbnailPath != null && !thumbnailPath.isBlank()) {
                        thumbnailUrl = s3Service.getPresignedUrl(thumbnailPath);
                    }

                    return new SlideDto(
                            subProject.getId(),
                            thumbnailUrl,
                            subProject.getFileName(),
                            "", // TODO 파일 사이즈
                            DateTimeUtils.dateTimeToDateFormat(subProject.getCreatedAt()) // TODO 파일 업로드 시간
                    );
                })
                .toList();
    }

    private AnalyticsDto getAnalyticsDto() {
        // TODO 모델 학습 지표 필요
        return new AnalyticsDto(
                List.of(),
                List.of(),
                List.of(),
                0
        );
    }

    //TODO svs 이미지 추가 업로드 구현 필요
}

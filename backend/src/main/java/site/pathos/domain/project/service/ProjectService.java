package site.pathos.domain.project.service;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
import site.pathos.domain.project.dto.response.ProjectDetailDto;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.aws.s3.dto.S3UploadFileDto;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final SubProjectRepository subProjectRepository;
    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final ModelRepository modelRepository;

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
            uploadFiles.add(new S3UploadFileDto(svsKey, file));

            AnnotationHistory annotationHistory = AnnotationHistory.builder()
                    .subProject(subProject)
                    .model(model)
                    .modelName(model.getName())
                    .build();
            annotationHistoryRepository.save(annotationHistory);
        }
        s3Service.uploadFilesAsync(uploadFiles);
    }
}

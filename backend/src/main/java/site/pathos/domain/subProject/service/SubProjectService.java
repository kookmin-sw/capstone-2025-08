package site.pathos.domain.subProject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistorySummaryDto;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.ModelSummaryDto;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.Repository.ProjectModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.subProject.dto.response.SubProjectResponseDto;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.domain.userModel.repository.UserModelRepository;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class SubProjectService {

    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final UserModelRepository userModelRepository;
    private final SubProjectRepository subProjectRepository;
    private final ProjectModelRepository projectModelRepository;
    private final ProjectRepository projectRepository;
    private final ModelRepository modelRepository;

    @Transactional(readOnly = true)
    public SubProjectResponseDto getSubProject(Long subProjectId){
        //TODO 추후에 메서드 분리 필요
        List<AnnotationHistory> histories = annotationHistoryRepository
                .findAllBySubProjectId(subProjectId)
                .stream()
                .sorted(Comparator.comparing(AnnotationHistory::getStartedAt)) // startedAt 기준 정렬
                .toList();

        List<AnnotationHistorySummaryDto> historyDtos = IntStream.range(0, histories.size())
                .mapToObj(i -> {
                    AnnotationHistory h = histories.get(i);
                    return new AnnotationHistorySummaryDto(
                            h.getId(),
                            i+1,
                            h.getStartedAt(),
                            h.getCompletedAt()// 1번부터 시작
                    );
                })
                .toList();

        Long latestAnnotationHistoryId = histories.isEmpty()
                ? null
                : histories.get(histories.size() - 1).getId();


        //TODO 나중에 실제 userId로 변경 필요
        Long userId =  1L;

        Project project = getProjectBySubProjectId(subProjectId, userId);

        List<ModelSummaryDto> modelDtos = getProjectModels(project.getId());

        return new SubProjectResponseDto(
                subProjectId,
                historyDtos,
                latestAnnotationHistoryId,
                modelDtos,
                project.getModelType()
        );
    }

    @Transactional
    public void markTilingAsComplete(Long subProjectId){
        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new IllegalArgumentException("SubProject not found: " + subProjectId));

        subProject.markTilingCompleted();
    }

    private List<ModelSummaryDto> getProjectModels(Long projectId){
        List<ProjectModel> models = projectModelRepository.findByProjectIdOrderByCreatedAt(projectId);

        return models.stream()
                .map(projectModel -> {
                    Model model = projectModel.getModel();
                    return new ModelSummaryDto(model.getId(), model.getName());
                })
                .toList();
    }

    private Project getProjectBySubProjectId(Long subProjectId, Long userId) {
        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUB_PROJECT_NOT_FOUND));

        Project project = projectRepository.findProjectWithUserBySubProjectId(subProjectId);

        if (!project.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_PROJECT_ACCESS);
        }

        return project;
    }
}

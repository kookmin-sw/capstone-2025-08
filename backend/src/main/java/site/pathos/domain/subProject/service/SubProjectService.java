package site.pathos.domain.subProject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistorySummaryDto;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.ModelSummaryDto;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.subProject.dto.response.SubProjectResponseDto;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.domain.userModel.repository.UserModelRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubProjectService {

    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final UserModelRepository userModelRepository;
    private final SubProjectRepository subProjectRepository;

    public SubProjectResponseDto getSubProject(Long subProjectId){
        List<AnnotationHistory> histories = annotationHistoryRepository.findAllBySubProjectId(subProjectId);
        List<AnnotationHistorySummaryDto> historyDtos = histories.stream()
                .map(h -> new AnnotationHistorySummaryDto(
                        h.getId(),
                        h.getStartedAt(),
                        h.getCompletedAt() // 필요시 포맷 적용
                ))
                .toList();

        //TODO 나중에 실제 userId로 변경 필요
        Long userId =  1L;

        List<Model> models = userModelRepository.findAllModelsByUserId(userId); // 조건에 따라 필터링 가능
        List<ModelSummaryDto> modelDtos = models.stream()
                .map(m -> new ModelSummaryDto(
                        m.getId(),
                        m.getName()
                ))
                .toList();

        Project project = subProjectRepository.findProjectBySubProjectId(subProjectId);

        return new SubProjectResponseDto(
                subProjectId,
                historyDtos,
                modelDtos,
                project.getModelType()
        );
    }
}

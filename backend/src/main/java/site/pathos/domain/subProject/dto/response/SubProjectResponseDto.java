package site.pathos.domain.subProject.dto.response;

import site.pathos.domain.annotationHistory.dto.response.AnnotationHistorySummaryDto;
import site.pathos.domain.model.ModelSummaryDto;
import site.pathos.domain.model.entity.ModelType;

import java.util.List;

public record SubProjectResponseDto(
        Long subProjectId,
        List<AnnotationHistorySummaryDto> annotationHistories,
        List<ModelSummaryDto> availableModels,
        ModelType modelType
) {
}

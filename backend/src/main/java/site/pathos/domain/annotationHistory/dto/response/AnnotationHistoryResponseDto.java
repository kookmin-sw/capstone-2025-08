package site.pathos.domain.annotationHistory.dto.response;

import site.pathos.domain.label.dto.LabelDto;
import site.pathos.domain.roi.dto.response.RoiResponsePayload;

import java.util.List;

public record AnnotationHistoryResponseDto(
        Long id,
        String modelName,
        List<RoiResponsePayload> roiPayloads,
        List<LabelDto> labels
) { }

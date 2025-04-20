package site.pathos.domain.annotationHistory.dto.response;

import site.pathos.domain.roi.dto.request.RoiPayload;
import java.util.List;

public record AnnotationHistoryResponseDto(
        Long id,
        String modelName,
        List<RoiPayload> roiPayloads
) { }

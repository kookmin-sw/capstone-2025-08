package site.pathos.domain.annotationHistory.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.label.dto.LabelDto;
import site.pathos.domain.roi.dto.response.RoiResponsePayload;

import java.util.List;

public record AnnotationHistoryResponseDto(
        @Schema(description = "Annotation History의 ID", example = "1")
        Long id,

        @Schema(description = "ROI 데이터 목록")
        List<RoiResponsePayload> roiPayloads
) {}
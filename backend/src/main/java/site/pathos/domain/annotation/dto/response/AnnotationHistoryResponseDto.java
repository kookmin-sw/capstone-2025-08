package site.pathos.domain.annotation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record AnnotationHistoryResponseDto(
        @Schema(description = "Annotation History의 ID", example = "1")
        Long annotationHistoryId,

        @Schema(description = "ROI 데이터 목록")
        List<RoiResponsePayload> roiPayloads
) {}
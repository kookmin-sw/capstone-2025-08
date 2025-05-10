package site.pathos.domain.annotationHistory.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "어노테이션 히스토리 요약 정보 DTO")
public record AnnotationHistorySummaryDto(

        @Schema(description = "히스토리 ID", example = "1001")
        Long id,
        @Schema(description = "히스토리 순서", example = "1")
        int order,
        @Schema(description = "히스토리 시작 시각", example = "2025-05-01T12:00:00")
        LocalDateTime startedAt,
        @Schema(description = "히스토리 종료 시각", example = "2025-05-01T13:00:00")
        LocalDateTime completedAt
) {
}
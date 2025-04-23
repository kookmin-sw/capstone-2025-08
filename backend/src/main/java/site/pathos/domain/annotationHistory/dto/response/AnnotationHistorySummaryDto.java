package site.pathos.domain.annotationHistory.dto.response;

import java.time.LocalDateTime;

public record AnnotationHistorySummaryDto(
        Long id,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
}

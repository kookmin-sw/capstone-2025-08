package site.pathos.domain.annotationHistory.dto.response;

import java.time.LocalDateTime;

public record AnnotationHistorySummaryDto(
        Long id,
        int order,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
}

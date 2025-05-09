package site.pathos.domain.project.dto;

import java.util.List;
import site.pathos.domain.model.entity.ModelType;

public record GetProjectDetailResponseDto(
        Long projectId,
        String title,
        String description,
        ModelType modelType,
        String modelName,
        String createdAt,   // 2025. 03. 01 (Sat)
        String updatedAt,   // 2025. 03. 01 (Sat)
        SlideSummaryDto slideSummary,
        ModelProcessDto modelProcess,
        List<LabelDto> labels,
        List<SlideDto> slides,
        AnalyticsDto analytics
) {
    public record SlideSummaryDto(
            int totalSlides,        // 15
            int uploadProgress,     // 60
            String lastUploadedDateTime // 2024-04-03 03:30 PM
    ) {
    }
    public record ModelProcessDto(
            String status,      // Progress
            double progress,    // 92.5
            int currentEpoch,
            int totalEpoch,
            String estimatedCompletionDateTime // 2024-04-03 03:30 PM
    ) {
    }
    public record LabelDto(
        String name,    //Tumor
        String color
    ) {
    }
    public record SlideDto(
            Long subProjectId,
            String thumbnailUrl,
            String name,        // svs_example.svs
            String size,        // 1.5MB
            String uploadedOn   // 2025-03-31
    ) {
    }
    public record AnalyticsDto(
            List<Integer> epochs,   // 1,2,3,4,5
            List<Double> loss,
            List<Double> iou,
            double f1Score      //81.0
    ) {
    }
}

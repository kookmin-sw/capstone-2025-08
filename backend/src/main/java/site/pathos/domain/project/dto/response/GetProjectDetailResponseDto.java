package site.pathos.domain.project.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import site.pathos.domain.model.entity.ModelType;

public record GetProjectDetailResponseDto(
        @Schema(description = "프로젝트 id", example = "1")
        Long projectId,
        @Schema(description = "프로젝트명", example = "Upsilon Viz")
        String title,
        @Schema(description = "프로젝트 설명", example = "Initial tissue analysis project")
        String description,
        @Schema(description = "모델 타입", example = "TISSUE")
        ModelType modelType,
        @Schema(description = "모델명", example = "Model A")
        String modelName,
        @Schema(description = "프로젝트 생성일", example = "2025. 03. 01 (Sat)")
        String createdAt,
        @Schema(description = "프로젝트 수정일", example = "2025. 03. 01 (Sat)")
        String updatedAt,
        SlideSummaryDto slideSummary,
        ModelProcessDto modelProcess,
        List<LabelDto> labels,
        List<SlideDto> slides,
        AnalyticsDto analytics
) {
    public record SlideSummaryDto(
            @Schema(description = "총 슬라이드 개수", example = "15")
            int totalSlides,
            @Schema(description = "업로드 진행률", example = "60")
            int uploadProgress,
            @Schema(description = "마지막 업로드 시간", example = "2024-04-03 03:30 PM")
            String lastUploadedDateTime
    ) {
    }

    public record ModelProcessDto(
            @Schema(description = "학습 및 추론 상태", example = "Progress")
            String status,
            @Schema(description = "학습 및 추론 진행률", example = "92.5")
            double progress,
            @Schema(description = "현재 에폭", example = "15")
            int currentEpoch,
            @Schema(description = "총 에폭", example = "20")
            int totalEpoch,
            @Schema(description = "마지막 완료 시간", example = "2024-04-03 03:30 PM")
            String estimatedCompletionDateTime
    ) {
    }

    public record LabelDto(
            @Schema(description = "라벨 이름", example = "Tumor")
            String name,
            @Schema(description = "라벨 색상", example = "#FF0000")
            String color
    ) {
    }

    public record SlideDto(
            @Schema(description = "서브 프로젝트 id", example = "1")
            Long subProjectId,
            @Schema(description = "썸네일 이미지 url", example = "https://www.example.com/test.jpg")
            String thumbnailUrl,
            @Schema(description = "파일명", example = "svs_example.svs")
            String name,
            @Schema(description = "파일 크기", example = "1.5MB")
            String size,
            @Schema(description = "업로드 날짜", example = "2025-03-31")
            String uploadedOn
    ) {
    }

    public record AnalyticsDto(
            @Schema(description = "epoch 목록", example = "[1, 2, 3, 4, 5]")
            List<Integer> epochs,
            @Schema(description = "epoch별 loss 값", example = "[0.9, 0.75, 0.5, 0.3, 0.25]")
            List<Double> loss,
            @Schema(description = "epoch별 IoU 값", example = "[0.4, 0.6, 0.65, 0.73, 0.75]")
            List<Double> iou,
            @Schema(description = "f1 점수", example = "81.0")
            double f1Score
    ) {
    }
}

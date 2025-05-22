package site.pathos.domain.sharedProject.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "공유 프로젝트 상세 응답 DTO")
public record GetSharedProjectDetailResponseDto(

        @Schema(description = "공유 프로젝트 ID", example = "1")
        Long sharedProjectId,

        @Schema(description = "공유 프로젝트 제목", example = "AI 기반 병리 세포 분석 프로젝트")
        String title,

        @Schema(description = "공유 프로젝트 설명", example = "AI 모델을 이용한 세포의 종양 여부 분석 프로젝트입니다.")
        String description,

        @Schema(description = "공유 프로젝트 생성일", example = "2025-05-21T14:33:22")
        LocalDateTime createdAt,

        @Schema(description = "작성자 이름", example = "이정욱")
        String authorName,

        @Schema(description = "사용된 모델 정보")
        ModelInfo model,

        @Schema(description = "태그 목록", example = "[\"Cell\", \"Tissue\", \"DataSet\"]")
        List<String> tags,

        @Schema(description = "원본 이미지 경로 목록", example = "[\"https://pathos-bucket.s3.amazonaws.com/original1.png\"]")
        List<String> originalImagePaths,

        @Schema(description = "결과 이미지 경로 목록", example = "[\"https://pathos-bucket.s3.amazonaws.com/result1.png\"]")
        List<String> resultImagePaths

) {
    @Schema(description = "모델 정보 DTO")
    public record ModelInfo(

            @Schema(description = "모델 ID", example = "101")
            Long modelId,

            @Schema(description = "모델명", example = "TumorCellClassifierV1")
            String modelName

    ) {
    }
}
package site.pathos.domain.project.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "서브 프로젝트 요약 정보 DTO")
public record SubProjectSummaryDto(

        @Schema(description = "서브 프로젝트 ID", example = "101")
        Long subProjectId,

        @Schema(description = "서브 프로젝트 썸네일 URL", example = "https://example.com/subproject-101/thumbnail.jpg")
        String thumbnailUrl,

        @Schema(description = "타일링 이미지 URL", example = "https://example.com/sub-project/25/tiles/output_slide.dzi")
        String tileImageUrl,

        @Schema(description = "이미지 업로드 여부 완료", example = "true")
        boolean isUploadComplete
) {
}
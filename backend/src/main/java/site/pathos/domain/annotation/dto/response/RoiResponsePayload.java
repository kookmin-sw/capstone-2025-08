package site.pathos.domain.annotation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record RoiResponsePayload(
        @Schema(description = "ROI의 표시 순서", example = "1")
        int displayOrder,

        @Schema(description = "ROI의 위치 및 크기 정보")
        RoiResponseDto detail,

        @Schema(
                description = "조직 주석 이미지 경로 목록",
                example = "[\"sub-project/1/annotation-history/2/roi-3/train/tissue1.png\", \"sub-project/1/annotation-history/2/roi-3/train/tissue2.png\"]"
        )
        List<String> tissue_path,

        @Schema(description = "세포 위치 정보 목록")
        List<CellDetail> cell
) {
}
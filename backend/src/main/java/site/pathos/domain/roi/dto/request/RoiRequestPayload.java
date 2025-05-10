package site.pathos.domain.roi.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;

import java.util.List;

public record RoiRequestPayload(

        @Schema(description = "화면에 표시될 ROI 순서", example = "0")
        int displayOrder,

        @Schema(description = "ROI 상세 정보")
        RoiRequestDto detail,

        @Schema(description = "조직 이미지 경로 리스트", example = "[\"s3://{bucket-name}/sub-project/1/roi-1/tile1.jpg\"]")
        List<String> tissue_path,

        @Schema(description = "세포 좌표 리스트")
        List<CellDetail> cell

) {}
package site.pathos.domain.annotation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "세포 어노테이션 정보")
public record CellDetail(

        @Schema(description = "세포 클래스 인덱스", example = "0")
        int classIndex,

        @Schema(description = "세포 색상 (Hex)", example = "#FF0000")
        String color,

        @Schema(description = "세포 외곽 폴리곤 정보")
        PolygonDto polygon

) {}
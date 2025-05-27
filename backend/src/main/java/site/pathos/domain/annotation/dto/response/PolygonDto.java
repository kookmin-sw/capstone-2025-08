package site.pathos.domain.annotation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Polygon 좌표 정보")
public record PolygonDto(

        @Schema(description = "꼭짓점 좌표 리스트", example = "[{\"x\":123,\"y\":456}, {\"x\":124,\"y\":457}]")
        List<PointDto> points

) {
    @Schema(description = "2D 평면 상의 좌표")
    public record PointDto(

            @Schema(description = "X 좌표", example = "123")
            int x,

            @Schema(description = "Y 좌표", example = "456")
            int y
    ) {}
}


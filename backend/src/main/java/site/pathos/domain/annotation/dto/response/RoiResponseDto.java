package site.pathos.domain.annotation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record RoiResponseDto(
        @Schema(description = "ROI ID", example = "1")
        Long id,

        @Schema(description = "ROI의 X 좌표", example = "100")
        int x,

        @Schema(description = "ROI의 Y 좌표", example = "200")
        int y,

        @Schema(description = "ROI의 너비", example = "512")
        int width,

        @Schema(description = "ROI의 높이", example = "512")
        int height,

        @Schema(description = "ROI의 결함 백분율 19", example = "19")
        int faulty
) {}
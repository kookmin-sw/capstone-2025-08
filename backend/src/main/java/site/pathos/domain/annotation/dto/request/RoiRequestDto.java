package site.pathos.domain.annotation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record RoiRequestDto(
        @Schema(description = "ROI의 X 좌표", example = "120")
        int x,

        @Schema(description = "ROI의 Y 좌표", example = "340")
        int y,

        @Schema(description = "ROI의 너비", example = "512")
        int width,

        @Schema(description = "ROI의 높이", example = "512")
        int height
) {
}
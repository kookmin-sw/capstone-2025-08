package site.pathos.domain.annotation.cellAnnotation.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record CellDetail(
        @Schema(description = "세포의 X 좌표", example = "120")
        int x,
        @Schema(description = "세포의 Y 좌표", example = "340")
        int y
) {}
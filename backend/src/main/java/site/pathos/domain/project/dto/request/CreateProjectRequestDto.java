package site.pathos.domain.project.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.model.enums.ModelType;

public record CreateProjectRequestDto(
        @Schema(description = "프로젝트명", example = "Upsilon Viz")
        String title,
        @Schema(description = "프로젝트 설명", example = "Initial tissue analysis project")
        String description,
        @Schema(description = "모델 id", example = "1")
        Long modelId,
        @Schema(description = "모델 타입", example = "TISSUE")
        ModelType modelType
) {
}
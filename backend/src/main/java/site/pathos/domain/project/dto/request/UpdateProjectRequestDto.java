package site.pathos.domain.project.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record UpdateProjectRequestDto(
        @Schema(description = "프로젝트명", example = "Upsilon Viz")
        String title,
        @Schema(description = "프로젝트 설명", example = "Initial tissue analysis project")
        String description
) {
}

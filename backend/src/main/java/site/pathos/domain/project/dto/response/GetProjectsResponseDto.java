package site.pathos.domain.project.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import site.pathos.domain.model.entity.ModelType;
import site.pathos.global.common.PaginationResponse;

public record GetProjectsResponseDto(
        PaginationResponse<GetProjectsResponseDetailDto> project,
        List<GetProjectsResponseModelsDto> models
) {
    public record GetProjectsResponseDetailDto(
            @Schema(description = "프로젝트 id", example = "1")
            Long projectId,
            @Schema(description = "프로젝트명", example = "Upsilon Viz")
            String title,
            @Schema(description = "프로젝트 생성일", example = "2025. 03. 20 (Thu)")
            String createdAt,
            @Schema(description = "프로젝트 수정일", example = "2025. 03. 21 (Fri)")
            String updatedAt,
            @Schema(description = "모델 타입", example = "TISSUE")
            ModelType modelType,
            @Schema(description = "모델명", example = "Model A")
            String modelName,
            @Schema(
                    description = "썸네일 이미지 url",
                    example = "[\"https://www.example.com/test1.jpg\", \"https://www.example.com/test2.jpg\", \"https://www.example.com/test3.jpg\", \"https://www.example.com/test4.jpg\"]"
            )
            List<String> thumbnailUrl
    ) {
    }

    public record GetProjectsResponseModelsDto(
            @Schema(description = "모델 id", example = "1")
            Long modelId,
            @Schema(description = "모델 타입", example = "TISSUE")
            ModelType modelType,
            @Schema(description = "모델명", example = "Model A")
            String modelName
    ) {
    }
}

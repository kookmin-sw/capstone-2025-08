package site.pathos.domain.project.dto.response;

import java.util.List;
import site.pathos.domain.model.entity.ModelType;
import site.pathos.global.common.PaginationResponse;

public record GetProjectsResponseDto(
        PaginationResponse<GetProjectsResponseDetailDto> project,
        List<GetProjectsResponseModelsDto> models
) {
    public record GetProjectsResponseDetailDto(
            Long projectId,
            String title,
            String createdAt,
            String updatedAt,
            ModelType modelType,
            String modelName,
            List<String> thumbnailUrl
    ) {
    }

    public record GetProjectsResponseModelsDto(
            Long modelId,
            ModelType modelType,
            String modelName
    ) {
    }
}

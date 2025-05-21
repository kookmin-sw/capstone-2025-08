package site.pathos.domain.sharedProject.dto.response;

import java.util.List;

public record GetProjectWithModelsResponseDto(
        List<ProjectModelsDto> projects
) {
    public record ProjectModelsDto(
            Long projectId,

            String projectTitle,

            List<modelsDto> models
    ){
        public record modelsDto(
                Long modelId,
                String modelName
        ){}
    }
}

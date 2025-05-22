package site.pathos.domain.sharedProject.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "프로젝트와 해당 프로젝트에 속한 모델 목록 응답 DTO")
public record GetProjectWithModelsResponseDto(

        @Schema(description = "프로젝트 목록")
        List<ProjectModelsDto> projects

) {
    @Schema(description = "프로젝트 및 해당 프로젝트에 속한 모델 정보 DTO")
    public record ProjectModelsDto(

            @Schema(description = "프로젝트 ID", example = "1")
            Long projectId,

            @Schema(description = "프로젝트 제목", example = "암세포 분류 프로젝트")
            String projectTitle,

            @Schema(description = "해당 프로젝트에 속한 모델 리스트")
            List<ModelsDto> models

    ) {
        @Schema(description = "모델 정보 DTO")
        public record ModelsDto(

                @Schema(description = "모델 ID", example = "101")
                Long modelId,

                @Schema(description = "모델명", example = "TumorClassifierV1")
                String modelName

        ) {}
    }
}
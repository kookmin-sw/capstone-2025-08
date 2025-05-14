package site.pathos.domain.project.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.model.entity.ModelType;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;

import java.util.List;

@Schema(description = "프로젝트 상세에서 서브 프로젝트들을 조회할 때 사용하는 응답 DTO")
public record GetSubProjectResponseDto(

        @Schema(description = "프로젝트 ID", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 제목", example = "Upsilon Viz")
        String title,

        ModelsDto modelsDto,

        List<LabelDto> labels,

        @Schema(description = "서브 프로젝트 요약 정보 리스트")
        List<SubProjectSummaryDto> subProjects
) {
        public record ModelsDto(
                ModelType modelType,

                List<ProjectModelsDto> projectModels
        ){}

        public record ProjectModelsDto(
                Long modelId,

                String name
        ){ }

        public record LabelDto(
                Long labelId,

                String name,

                String color
        ){}
}
package site.pathos.domain.annotation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.model.enums.ModelType;
import site.pathos.domain.project.dto.response.SubProjectSummaryDto;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "프로젝트 어노테이션 화면을 조회할 때 사용하는 응답 DTO")
public record GetProjectAnnotationResponseDto(

        @Schema(description = "프로젝트 ID", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 제목", example = "Upsilon Viz")
        String title,

        @Schema(description = "모델 정보 DTO")
        ModelsDto modelsDto,

        @Schema(description = "프로젝트 라벨 리스트")
        List<ProjectLabelDto> labels,

        @Schema(description = "서브 프로젝트 요약 정보 리스트")
        List<SubProjectSummaryDto> subProjects,

        @Schema(description = "첫 번째 서브프로젝트 아이디")
        Long firstSubProjectId
) {
        @Schema(description = "프로젝트에서 사용 가능한 모델 목록 DTO")
        public record ModelsDto(
                @Schema(description = "모델 타입", example = "TISSUE")
                ModelType modelType,

                @Schema(description = "프로젝트에 연결된 모델 목록")
                List<ProjectModelsDto> projectModels
        ) {}

        @Schema(description = "단일 모델 정보 DTO")
        public record ProjectModelsDto(
                @Schema(description = "모델 ID", example = "5")
                Long modelId,

                @Schema(description = "모델 이름", example = "Cancer Classifier v1")
                String name
        ) {}

        @Schema(description = "프로젝트에서 사용되는 라벨 정보 DTO")
        public record ProjectLabelDto(
                @Schema(description = "라벨 ID", example = "2")
                Long labelId,

                @Schema(description = "라벨 이름", example = "Tumor Region")
                String name,

                @Schema(description = "라벨 색상 (HEX 코드)", example = "#FF5733")
                String color,

                @Schema(description = "정렬 순서", example = "2")
                int displayOrder,

                @Schema(description = "생성 일자")
                LocalDateTime createdAt

        ) {}
}
package site.pathos.domain.project.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.annotation.dto.response.AnnotationHistorySummaryDto;
import site.pathos.domain.model.enums.ModelType;

import java.util.List;

@Schema(description = "서브 프로젝트 상세 응답 DTO")
public record SubProjectResponseDto(
        @Schema(description = "서브 프로젝트 ID", example = "42")
        Long subProjectId,

        @Schema(description = "어노테이션 히스토리 요약 정보 리스트")
        List<AnnotationHistorySummaryDto> annotationHistories,

        @Schema(description = "가장 최근의 어노테이션 히스토리 ID", example = "101")
        Long latestAnnotationHistoryId,

        @Schema(description = "선택 가능한 모델 리스트")
        List<ModelSummaryDto> availableModels,

        @Schema(description = "모델 타입", example = "CELL")
        ModelType modelType
) {
        @Schema(description = "사용 가능한 모델 요약 정보 DTO")
        public record ModelSummaryDto(

                @Schema(description = "모델 ID", example = "1")
                Long id,

                @Schema(description = "모델 이름", example = "TissueNet V2")
                String name
        ) {
        }
}
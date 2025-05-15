package site.pathos.domain.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "사용 가능한 모델 요약 정보 DTO")
public record ModelSummaryDto(

        @Schema(description = "모델 ID", example = "1")
        Long id,

        @Schema(description = "모델 이름", example = "TissueNet V2")
        String name
) {
}
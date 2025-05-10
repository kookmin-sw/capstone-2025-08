package site.pathos.domain.label.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record LabelDto(
        @Schema(description = "라벨 ID. 생성 시 null, 수정 시 값 필요", example = "1")
        Long id,

        @Schema(description = "라벨 이름", example = "Cancer Cell")
        String name,

        @Schema(description = "라벨 색상 (HEX 코드)", example = "#FF5733")
        String color
) {
}
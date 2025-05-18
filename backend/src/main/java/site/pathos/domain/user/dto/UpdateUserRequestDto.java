package site.pathos.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UpdateUserRequestDto(
        @Schema(description = "사용자 이름", example = "홍길동")
        String name
) {
}

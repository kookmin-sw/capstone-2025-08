package site.pathos.global.common;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record PaginationResponse<T>(
        List<T> content,
        @Schema(description = "한 페이지 컨텐츠 개수", example = "9")
        int pageSize,
        @Schema(description = "현재 페이지 번호 (1부터 시작)", example = "1")
        int currentPage,
        @Schema(description = "전체 페이지 수", example = "5")
        int totalPages,
        @Schema(description = "전체 요소 수", example = "45")
        long totalElements
) {
}

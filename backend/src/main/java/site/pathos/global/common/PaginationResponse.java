package site.pathos.global.common;

import java.util.List;

public record PaginationResponse<T>(
        List<T> content,
        int pageSize,       //페이지 크기
        int currentPage,    //현재 페이지
        int totalPages,     //전체 페이지
        long totalElements  //전체 데이터 수
) {
}

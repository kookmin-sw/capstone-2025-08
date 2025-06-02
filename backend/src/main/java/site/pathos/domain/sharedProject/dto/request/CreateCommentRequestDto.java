package site.pathos.domain.sharedProject.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.sharedProject.enums.CommentTag;

public record CreateCommentRequestDto(
        @Schema(description = "댓글 내용", example = "좋은 프로젝트 감사합니다!")
        String content,

        @Schema(description = "댓글 태그 (COMMENT, FIX, QUESTION 등)", example = "GENERAL")
        CommentTag commentTag,

        @Schema(description = "부모 댓글 ID (대댓글일 경우 지정, 최상위 댓글일 경우 null)", example = "null")
        Long parentId
) {
}

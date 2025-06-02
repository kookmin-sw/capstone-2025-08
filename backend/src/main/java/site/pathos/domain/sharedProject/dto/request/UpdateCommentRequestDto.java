package site.pathos.domain.sharedProject.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "댓글 수정 요청")
public record UpdateCommentRequestDto(
        @Schema(description = "수정할 댓글 내용", example = "내용을 수정했어요.")
        String content
) {}

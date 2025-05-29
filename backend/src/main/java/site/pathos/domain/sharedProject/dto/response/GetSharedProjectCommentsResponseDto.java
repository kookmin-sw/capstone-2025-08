package site.pathos.domain.sharedProject.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.sharedProject.entity.Comment;
import site.pathos.domain.sharedProject.enums.CommentTag;
import site.pathos.global.aws.s3.S3Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Schema(description = "공유 프로젝트의 댓글 목록 응답")
public record GetSharedProjectCommentsResponseDto(
        @Schema(description = "댓글 리스트")
        List<CommentDto> comments
) {
    @Schema(description = "댓글 정보", example = """
        {
          "commentId": 1,
          "authorName": "Jane Doe",
          "content": "이 프로젝트 정말 유용하네요!",
          "commentTag": "GENERAL",
          "createdAt": "2025-05-26T12:00:00",
          "replies": [
            {
              "commentId": 2,
              "authorName": "John Smith",
              "content": "저도 그렇게 생각해요!",
              "commentTag": "GENERAL",
              "createdAt": "2025-05-26T12:30:00",
              "replies": [
                {
                  "commentId": 3,
                  "authorName": "Alice",
                  "content": "좋은 토론이네요.",
                  "commentTag": "GENERAL",
                  "createdAt": "2025-05-26T13:00:00",
                  "replies": []
                }
              ]
            }
          ]
        }
    """)
    public record CommentDto(
            @Schema(description = "댓글 ID", example = "1")
            Long commentId,

            @Schema(description = "작성자 이름", example = "Jane Doe")
            String authorName,

            @Schema(description = "작성자 프로필")
            String profileImageUrl,

            @Schema(description = "댓글 내용", example = "이 프로젝트 정말 유용하네요!")
            String content,

            @Schema(description = "댓글 태그", example = "GENERAL")
            CommentTag commentTag,

            @Schema(description = "작성 시간", example = "2025-05-26T12:00:00")
            LocalDateTime createdAt,

            @Schema(description = "대댓글 리스트")
            List<CommentDto> replies,

            @Schema(description = "댓글 삭제 여부", example = "false")
            boolean isDeleted
    ) {
        public static CommentDto from(Comment comment, S3Service s3Service) {
            return new CommentDto(
                    comment.getId(),
                    comment.getUser().getName(),
                    s3Service.getPresignedUrl(comment.getUser().getProfileImagePath()),
                    comment.isDeleted() ? "삭제된 메시지입니다" : comment.getContent(),
                    comment.getCommentTag(),
                    comment.getCreatedAt(),
                    new ArrayList<>(),
                    comment.isDeleted()
            );
        }
    }
}
package site.pathos.domain.notification.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record GetNotificationsResponseDto(
        @Schema(description = "알림 ID", example = "1")
        Long id,
        @Schema(description = "알림 제목", example = "File upload completed")
        String title,
        @Schema(description = "알림 메시지 내용", example = "\"Project Title\"project has been uploaded successfully.")
        String message,
        @Schema(description = "클릭 시 이동할 경로", example = "/main/projects/1")
        String redirectPath,
        @Schema(description = "읽음 여부", example = "false")
        boolean isRead,
        @Schema(description = "알림 발생 후 경과 시간", example = "2 minutes ago")
        String timeAgo
) {
}

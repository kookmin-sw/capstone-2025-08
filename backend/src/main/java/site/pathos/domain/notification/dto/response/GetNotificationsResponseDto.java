package site.pathos.domain.notification.dto.response;

public record GetNotificationsResponseDto(
        Long id,
        String title,
        String message,
        String redirectPath,
        boolean isRead,
        String timeAgo
) {
}

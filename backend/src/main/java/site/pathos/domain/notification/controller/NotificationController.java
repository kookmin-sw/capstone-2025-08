package site.pathos.domain.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.notification.dto.response.GetNotificationsResponseDto;
import site.pathos.domain.notification.service.UserNotificationService;
import site.pathos.global.common.PaginationResponse;

@Tag(name = "Notification API", description = "알림 기능 API")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final UserNotificationService userNotificationService;

    @Operation(summary = "알림 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<PaginationResponse<GetNotificationsResponseDto>> getNotifications(
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                userNotificationService.getNotifications(page)
        );
    }

    @Operation(summary = "알림을 읽은 것으로 처리합니다.")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> readNotification(
            @PathVariable("notificationId") Long notificationId
    ) {
        userNotificationService.readNotification(notificationId);
        return ResponseEntity.ok().build();
    }
}

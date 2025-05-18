package site.pathos.domain.notification.controller;

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

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final UserNotificationService userNotificationService;

    @GetMapping
    public ResponseEntity<PaginationResponse<GetNotificationsResponseDto>> getNotifications(
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                userNotificationService.getNotifications(page)
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> readNotification(
            @PathVariable("notificationId") Long notificationId
    ) {
        userNotificationService.readNotification(notificationId);
        return ResponseEntity.ok().build();
    }
}

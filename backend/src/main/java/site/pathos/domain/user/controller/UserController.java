package site.pathos.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.notification.service.UserNotificationSettingService;
import site.pathos.domain.user.dto.GetMyPageResponseDto;
import site.pathos.domain.user.dto.UpdateUserNotificationSettingsRequestDto;
import site.pathos.domain.user.dto.UpdateUserRequestDto;
import site.pathos.domain.user.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserNotificationSettingService userNotificationSettingService;

    @Operation(summary = "사용자의 설정 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<GetMyPageResponseDto> getMyPage() {
        return ResponseEntity.ok(
                userService.getMyPage()
        );
    }

    @Operation(summary = "사용자의 이름을 수정합니다.")
    @PatchMapping("/me")
    public ResponseEntity<Void> updateUser(
            @RequestBody UpdateUserRequestDto request
    ) {
        userService.updateUser(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자의 알림 설정 정보를 수정합니다.")
    @PatchMapping("/me/notification-settings")
    public ResponseEntity<Void> updateUserNotificationSettings(
            @RequestBody UpdateUserNotificationSettingsRequestDto request
    ) {
        userNotificationSettingService.updateNotificationSettings(request);
        return ResponseEntity.noContent().build();
    }
}
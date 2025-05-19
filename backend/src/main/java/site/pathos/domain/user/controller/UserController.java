package site.pathos.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.notification.service.UserNotificationSettingService;
import site.pathos.domain.user.dto.GetUserSettingsResponseDto;
import site.pathos.domain.user.dto.UpdateNotificationSettingsRequestDto;
import site.pathos.domain.user.dto.UpdateUserNameRequestDto;
import site.pathos.domain.user.service.UserService;

@Tag(name = "Profile API", description = "유저 프로필 API")
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserNotificationSettingService userNotificationSettingService;

    @Operation(summary = "사용자의 설정 정보를 조회합니다.")
    @GetMapping
    public ResponseEntity<GetUserSettingsResponseDto> getUserSettings() {
        return ResponseEntity.ok(
                userService.getUserSettings()
        );
    }

    @Operation(summary = "사용자의 이름을 수정합니다.")
    @PatchMapping("/name")
    public ResponseEntity<Void> updateUserName(
            @RequestBody UpdateUserNameRequestDto request
    ) {
        userService.updateUserName(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "사용자의 알림 설정 정보를 수정합니다.")
    @PatchMapping("/notification-settings")
    public ResponseEntity<Void> updateNotificationSettings(
            @RequestBody UpdateNotificationSettingsRequestDto request
    ) {
        userNotificationSettingService.updateNotificationSettings(request);
        return ResponseEntity.noContent().build();
    }
}
package site.pathos.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record UpdateUserNotificationSettingsRequestDto(
        List<UpdateUserNotificationSettingsRequestNotificationDto> settings
) {
    public record UpdateUserNotificationSettingsRequestNotificationDto(
            @Schema(description = "알림 타입", example = "File Upload Completed")
            String type,
            @Schema(description = "알림 활성화 여부", example = "true")
            Boolean enabled
    ) {
    }
}

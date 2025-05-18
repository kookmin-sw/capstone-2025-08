package site.pathos.domain.user.dto;

import java.util.List;

public record UpdateUserNotificationSettingsRequestDto(
        List<UpdateUserNotificationSettingsRequestNotificationDto> settings
) {
    public record UpdateUserNotificationSettingsRequestNotificationDto(
            String type,
            Boolean enabled
    ) {
    }
}

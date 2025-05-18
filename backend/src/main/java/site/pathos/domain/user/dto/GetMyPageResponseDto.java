package site.pathos.domain.user.dto;

import java.util.List;

public record GetMyPageResponseDto(
        String email,
        String name,
        String profileImagePath,
        List<GetMyPageResponseNotificationSettingDto> notificationSettings
) {
    public record GetMyPageResponseNotificationSettingDto(
            String type,
            boolean enabled
    ) {}
}

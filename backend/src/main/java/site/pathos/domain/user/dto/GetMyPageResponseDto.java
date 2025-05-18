package site.pathos.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record GetMyPageResponseDto(
        @Schema(description = "사용자 이메일", example = "user@example.com")
        String email,
        @Schema(description = "사용자 이름", example = "홍길동")
        String name,
        @Schema(description = "프로필 이미지 경로", example = "www.example.com/image.jpg")
        String profileImagePath,
        List<GetMyPageResponseNotificationSettingDto> notificationSettings
) {
    public record GetMyPageResponseNotificationSettingDto(
            @Schema(description = "알림 타입", example = "File Upload Completed")
            String type,
            @Schema(description = "알림 활성화 여부", example = "true")
            Boolean enabled
    ) {}
}

package site.pathos.domain.user.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.notification.repository.UserNotificationSettingRepository;
import site.pathos.domain.user.dto.GetUserSettingsResponseDto;
import site.pathos.domain.user.dto.GetUserSettingsResponseDto.GetUserSettingsResponseNotificationDto;
import site.pathos.domain.user.dto.UpdateUserNameRequestDto;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final S3Service s3Service;

    @Transactional(readOnly = true)
    public GetUserSettingsResponseDto getUserSettings() {
        Long userId = 1L;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        String profileImagePresignedUrl = s3Service.getPresignedUrl(user.getProfileImagePath());

        List<UserNotificationSetting> settings = userNotificationSettingRepository.findByUserId(userId);
        List<GetUserSettingsResponseNotificationDto> notificationSettings = settings.stream()
                .map(setting -> {
                    NotificationType notificationType = setting.getNotificationType();
                    return new GetUserSettingsResponseNotificationDto(
                            notificationType.getCode().getDisplayName(),
                            setting.getIsEnabled()
                    );
                })
                .toList();

        return new GetUserSettingsResponseDto(
                user.getEmail(),
                user.getName(),
                profileImagePresignedUrl,
                notificationSettings
        );
    }

    @Transactional
    public void updateUserName(UpdateUserNameRequestDto request) {
        Long userId = 1L;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        user.updateName(request.name());
    }
}
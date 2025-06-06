package site.pathos.domain.notification.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.notification.repository.NotificationTypeRepository;
import site.pathos.domain.notification.repository.UserNotificationSettingRepository;
import site.pathos.domain.user.dto.UpdateNotificationSettingsRequestDto;
import site.pathos.domain.user.entity.User;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.security.util.SecurityUtil;

@Service
@RequiredArgsConstructor
public class UserNotificationSettingService {

    private final NotificationTypeRepository notificationTypeRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;

    // 신규 가입 시, 사용자 알림 설정
    @Transactional
    public void createNotificationSetting(User user) {
        List<NotificationType> notificationTypes = notificationTypeRepository.findAll();

        List<UserNotificationSetting> settings = notificationTypes.stream()
                .map(type -> UserNotificationSetting.builder()
                        .user(user)
                        .notificationType(type)
                        .build())
                .toList();

        userNotificationSettingRepository.saveAll(settings);
    }

    @Transactional
    public void updateNotificationSettings(UpdateNotificationSettingsRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<UserNotificationSetting> settings = userNotificationSettingRepository.findByUserIdWithType(userId);
        Map<String, UserNotificationSetting> settingMap = settings.stream()
                .collect(Collectors.toMap(
                        s -> s.getNotificationType().getCode().getDisplayName(),
                        Function.identity()
                ));

        for (UpdateNotificationSettingsRequestDto.UpdateUserNotificationSettingsRequestNotificationDto dto : request.settings()) {
            UserNotificationSetting setting = settingMap.get(dto.type());
            if (setting == null) {
                throw new BusinessException(ErrorCode.NOTIFICATION_SETTING_NOT_FOUND);
            }
            setting.updateEnabled(dto.enabled());
        }
    }
}
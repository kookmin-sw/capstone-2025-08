package site.pathos.domain.notification.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.notification.repository.NotificationTypeRepository;
import site.pathos.domain.notification.repository.UserNotificationSettingRepository;
import site.pathos.domain.user.entity.User;

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
}
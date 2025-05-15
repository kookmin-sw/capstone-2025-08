package site.pathos.domain.notification.service;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotification;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.notification.enums.NotificationTypeCode;
import site.pathos.domain.notification.repository.NotificationTypeRepository;
import site.pathos.domain.notification.repository.UserNotificationRepository;
import site.pathos.domain.notification.repository.UserNotificationSettingRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private final NotificationTypeRepository notificationTypeRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final UserNotificationRepository userNotificationRepository;

    @Transactional
    public void notify(User user, NotificationTypeCode type, Map<String,Object> templateVariables) {
        NotificationType notificationType = notificationTypeRepository.findByCode(type)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_TYPE_NOT_FOUND));

        boolean enabled = userNotificationSettingRepository.findByUserAndNotificationType(user, notificationType)
                .map(UserNotificationSetting::getIsEnabled)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_SETTING_NOT_FOUND));

        if (!enabled) {
            return;
        }

        // 템플릿 치환
        String title = render(notificationType.getTitleTemplate(), templateVariables);
        String message = render(notificationType.getMessageTemplate(), templateVariables);
        String redirectPath = render(notificationType.getRedirectPathTemplate(), templateVariables);

        UserNotification notif = UserNotification.builder()
                .user(user)
                .notificationType(notificationType)
                .title(title)
                .message(message)
                .redirectPath(redirectPath)
                .build();

        userNotificationRepository.save(notif);
    }

    private String render(String template, Map<String, Object> params) {
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            template = template.replace("{" + entry.getKey() + "}", entry.getValue().toString());
        }
        return template;
    }
}

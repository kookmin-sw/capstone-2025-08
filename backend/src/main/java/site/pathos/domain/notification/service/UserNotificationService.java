package site.pathos.domain.notification.service;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.notification.dto.response.GetNotificationsResponseDto;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotification;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.notification.enums.NotificationTypeCode;
import site.pathos.domain.notification.repository.NotificationTypeRepository;
import site.pathos.domain.notification.repository.UserNotificationRepository;
import site.pathos.domain.notification.repository.UserNotificationSettingRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.common.PaginationResponse;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.util.datetime.DateTimeUtils;

@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private final NotificationTypeRepository notificationTypeRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;
    private static final int DEFAULT_PAGE_SIZE = 20;

    @Transactional
    public void notify(User user, NotificationTypeCode type, Map<String, Object> templateVariables) {
        NotificationType notificationType = notificationTypeRepository.findByCode(type)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_TYPE_NOT_FOUND));

        boolean enabled = userNotificationSettingRepository.findByUserAndNotificationType(user, notificationType)
                .map(UserNotificationSetting::getIsEnabled)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_SETTING_NOT_FOUND));

        if (!enabled) {
            return;
        }

        // 템플릿 치환
        String message = render(notificationType.getMessageTemplate(), templateVariables);
        String redirectPath = render(notificationType.getRedirectPathTemplate(), templateVariables);

        UserNotification notif = UserNotification.builder()
                .user(user)
                .notificationType(notificationType)
                .title(type.getDisplayName())
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

    @Transactional(readOnly = true)
    public PaginationResponse<GetNotificationsResponseDto> getNotifications(int page) {
        int pageIndex = Math.max(page - 1, 0);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageIndex, DEFAULT_PAGE_SIZE, sort);

        User user = userRepository.findById(1L)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Page<UserNotification> pageData = userNotificationRepository.findByUser(user, pageable);

        List<GetNotificationsResponseDto> notifications = pageData.getContent().stream()
                .map(notification -> new GetNotificationsResponseDto(
                        notification.getId(),
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getRedirectPath(),
                        notification.getIsRead(),
                        DateTimeUtils.dateTimeToAgoFormat(notification.getCreatedAt())
                ))
                .toList();

        return new PaginationResponse<>(
                notifications,
                pageable.getPageSize(),
                page,
                pageData.getTotalPages(),
                pageData.getTotalElements()
        );
    }

    @Transactional
    public void readNotification(Long notificationId) {
        Long userId = 1L;
        UserNotification notification = userNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.readBy(userId);
    }
}

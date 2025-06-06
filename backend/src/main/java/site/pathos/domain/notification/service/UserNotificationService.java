package site.pathos.domain.notification.service;

import static site.pathos.domain.notification.constants.NotificationsConstants.NOTIFICATION_CHANNEL_PREFIX;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
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
import site.pathos.domain.user.service.UserService;
import site.pathos.global.common.PaginationResponse;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.security.util.SecurityUtil;
import site.pathos.global.util.datetime.DateTimeUtils;

@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private final NotificationTypeRepository notificationTypeRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserService userService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
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

        String message = render(notificationType.getMessageTemplate(), templateVariables);
        String redirectPath = render(notificationType.getRedirectPathTemplate(), templateVariables);

        UserNotification notification = UserNotification.builder()
                .user(user)
                .notificationType(notificationType)
                .title(type.getDisplayName())
                .message(message)
                .redirectPath(redirectPath)
                .build();

        userNotificationRepository.save(notification);

        publishToNotificationChannel(user.getId(), notification);
    }

    private String render(String template, Map<String, Object> params) {
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            template = template.replace(
                    String.format("{%s}", entry.getKey()),
                    entry.getValue().toString()
            );
        }
        return template;
    }

    @Transactional(readOnly = true)
    public PaginationResponse<GetNotificationsResponseDto> getNotifications(int page) {
        int pageIndex = Math.max(page - 1, 0);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageIndex, DEFAULT_PAGE_SIZE, sort);
        User user = userService.getCurrentUser();

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
        Long userId = SecurityUtil.getCurrentUserId();
        UserNotification notification = userNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.readBy(userId);
    }

    public void publishToNotificationChannel(Long userId, UserNotification notification) {
        GetNotificationsResponseDto dto = new GetNotificationsResponseDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRedirectPath(),
                notification.getIsRead(),
                DateTimeUtils.dateTimeToAgoFormat(notification.getCreatedAt())
        );
        try {
            String json = objectMapper.writeValueAsString(dto);
            redisTemplate.convertAndSend(NOTIFICATION_CHANNEL_PREFIX + userId, json);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.REDIS_PUBLISH_FAILED);
        }
    }
}

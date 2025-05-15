package site.pathos.domain.notification.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.user.entity.User;

@Repository
public interface UserNotificationSettingRepository extends JpaRepository<UserNotificationSetting, Long> {
    Optional<UserNotificationSetting> findByUserAndNotificationType(User user, NotificationType notificationType);
}

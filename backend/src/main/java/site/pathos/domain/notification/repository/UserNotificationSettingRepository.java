package site.pathos.domain.notification.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.entity.UserNotificationSetting;
import site.pathos.domain.user.entity.User;

@Repository
public interface UserNotificationSettingRepository extends JpaRepository<UserNotificationSetting, Long> {
    Optional<UserNotificationSetting> findByUserAndNotificationType(User user, NotificationType notificationType);
    List<UserNotificationSetting> findByUserId(Long userId);
    @Query("""
        SELECT s
          FROM UserNotificationSetting s
          JOIN FETCH s.notificationType t
         WHERE s.user.id = :userId
    """)
    List<UserNotificationSetting> findByUserIdWithType(@Param("userId") Long userId);
}

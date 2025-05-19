package site.pathos.domain.notification.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.notification.entity.NotificationType;
import site.pathos.domain.notification.enums.NotificationTypeCode;

@Repository
public interface NotificationTypeRepository extends JpaRepository<NotificationType, Long> {
    Optional<NotificationType> findByCode(NotificationTypeCode code);
}
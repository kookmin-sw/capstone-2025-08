package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.sharedProject.entity.DownloadLog;
import site.pathos.domain.user.entity.User;

public interface DownloadLogRepository extends JpaRepository<DownloadLog, Long> {
}

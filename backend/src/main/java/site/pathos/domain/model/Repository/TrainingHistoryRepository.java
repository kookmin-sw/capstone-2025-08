package site.pathos.domain.model.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.model.entity.TrainingHistory;

public interface TrainingHistoryRepository extends JpaRepository<TrainingHistory, Long> {
}

package site.pathos.domain.inferenceHistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.inferenceHistory.entity.TrainingHistory;

public interface TrainingHistoryRepository extends JpaRepository<TrainingHistory, Long> {
}

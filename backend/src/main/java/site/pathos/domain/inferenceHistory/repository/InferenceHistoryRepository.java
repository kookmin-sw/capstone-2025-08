package site.pathos.domain.inferenceHistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.inferenceHistory.entity.InferenceHistory;

import java.util.Optional;

@Repository
public interface InferenceHistoryRepository extends JpaRepository<InferenceHistory, Long> {
    Optional<InferenceHistory> findByAnnotationHistoryId(Long annotationHistoryId);
}

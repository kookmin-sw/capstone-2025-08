package site.pathos.domain.annotationHistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;

@Repository
public interface AnnotationHistoryRepository extends JpaRepository<AnnotationHistory, Long> {
}

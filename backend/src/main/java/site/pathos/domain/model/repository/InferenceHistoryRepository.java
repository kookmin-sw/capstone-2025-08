package site.pathos.domain.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.InferenceHistory;

@Repository
public interface InferenceHistoryRepository extends JpaRepository<InferenceHistory, Long> {
}

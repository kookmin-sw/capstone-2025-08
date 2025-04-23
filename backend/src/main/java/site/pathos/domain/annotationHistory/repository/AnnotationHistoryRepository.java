package site.pathos.domain.annotationHistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnotationHistoryRepository extends JpaRepository<AnnotationHistory, Long> {
    @Query("""
        SELECT ah
        FROM AnnotationHistory ah
        JOIN FETCH ah.subProject
        JOIN FETCH ah.model
        WHERE ah.id = :id
    """)
    Optional<AnnotationHistory> findWithSubProjectAndModelById(@Param("id") Long id);

    List<AnnotationHistory> findAllBySubProjectId(Long subProjectId);
}

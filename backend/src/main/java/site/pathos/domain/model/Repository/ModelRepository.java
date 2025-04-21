package site.pathos.domain.model.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.Model;

import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    @Query("""
    SELECT m
    FROM Model m
    WHERE m.annotationHistory.id = :annotationHistoryId""")
    Optional<Model> findByAnnotationHistoryId(@Param("annotationHistoryId") Long annotationHistoryId);
}

package site.pathos.domain.roi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.roi.entity.Roi;

import java.util.List;

@Repository
public interface RoiRepository extends JpaRepository<Roi, Long> {
    @Query("""
        SELECT DISTINCT r
        FROM Roi r
        LEFT JOIN FETCH r.tissueAnnotations ta
        WHERE r.annotationHistory.id = :historyId
    """)
    List<Roi> findAllWithTissueAnnotationsByHistoryId(@Param("historyId") Long historyId);
}
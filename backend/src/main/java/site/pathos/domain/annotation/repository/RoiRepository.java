package site.pathos.domain.annotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.annotation.entity.Roi;

import java.util.List;

@Repository
public interface RoiRepository extends JpaRepository<Roi, Long>{
    @Query("""
    SELECT r
    FROM Roi r
    WHERE r.annotationHistory.id = :historyId
    """)
    List<Roi> findAllByAnnotationHistoryId(@Param("historyId") Long historyId);

    @Query("""
    SELECT MAX(r.displayOrder)
    FROM Roi r 
    WHERE r.annotationHistory.id = :historyId
    """)
    Integer findMaxDisplayOrderByAnnotationHistory(@Param("historyId") Long historyId);
}
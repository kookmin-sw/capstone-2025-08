package site.pathos.domain.annotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.annotation.entity.CellAnnotation;

import java.util.List;

public interface CellAnnotationRepository extends JpaRepository<CellAnnotation, Long> {
    @Query("""
    SELECT ca
    FROM CellAnnotation ca
    WHERE ca.roi.id = :roiId""")
    List<CellAnnotation> findAllByRoiId(@Param("roiId") Long roiId);

    List<CellAnnotation> findAllByRoiIdIn(List<Long> roiIds);
}

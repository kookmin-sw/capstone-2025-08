package site.pathos.domain.annotation.cellAnnotation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.annotation.cellAnnotation.entity.CellAnnotation;
import site.pathos.domain.roi.entity.Roi;

import java.util.List;

public interface CellAnnotationRepository extends JpaRepository<CellAnnotation, Long> {
    @Query("""
    SELECT ca
    FROM CellAnnotation ca
    WHERE ca.roi.id = :roiId""")
    List<CellAnnotation> findAllByRoiId(@Param("roiId") Long roiId);
}

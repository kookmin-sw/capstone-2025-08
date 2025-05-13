package site.pathos.domain.annotation.tissueAnnotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.annotation.tissueAnnotation.entity.AnnotationType;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;

import java.util.List;

@Repository
public interface TissueAnnotationRepository extends JpaRepository<TissueAnnotation, Long> {
    @Query("SELECT t FROM TissueAnnotation t WHERE t.roi.id = :roiId")
    List<TissueAnnotation> findByRoiId(@Param("roiId") Long roiId);

    List<TissueAnnotation> findByRoiIdInAndAnnotationType(List<Long> roiIds, AnnotationType annotationType);
}

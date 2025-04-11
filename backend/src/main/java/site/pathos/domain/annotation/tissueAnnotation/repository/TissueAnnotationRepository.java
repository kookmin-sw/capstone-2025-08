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
    @Query("SELECT ta FROM TissueAnnotation ta WHERE ta.roi.annotationHistory.id = :historyId AND ta.annotationType = :type")
    List<TissueAnnotation> findMergedByAnnotationHistoryId(@Param("historyId") Long historyId, @Param("type") AnnotationType type);
}

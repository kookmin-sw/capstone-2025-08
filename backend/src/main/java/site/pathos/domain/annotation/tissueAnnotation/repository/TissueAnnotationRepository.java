package site.pathos.domain.annotation.tissueAnnotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;

@Repository
public interface TissueAnnotationRepository extends JpaRepository<TissueAnnotation, Long> {
}

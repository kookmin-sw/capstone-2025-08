package site.pathos.domain.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.label.entity.ModelProjectLabel;

import java.util.List;

public interface ModelProjectLabelRepository extends JpaRepository<ModelProjectLabel, Long> {
    @Query("""
    SELECT ml FROM ModelProjectLabel ml
    JOIN FETCH ml.projectLabel pl
    WHERE ml.model.id = :modelId
    AND pl.project.id = :projectId
""")
    List<ModelProjectLabel> findByModelIdAndProjectId(@Param("modelId") Long modelId, @Param("projectId") Long projectId);
}

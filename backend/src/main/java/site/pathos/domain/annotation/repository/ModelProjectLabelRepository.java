package site.pathos.domain.annotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.model.entity.ModelLabel;

import java.util.List;

public interface ModelProjectLabelRepository extends JpaRepository<ModelLabel, Long> {
    @Query("""
    SELECT ml FROM ModelLabel ml
    JOIN FETCH ml.projectLabel pl
    WHERE ml.model.id = :modelId
    AND pl.project.id = :projectId
""")
    List<ModelLabel> findByModelIdAndProjectId(@Param("modelId") Long modelId, @Param("projectId") Long projectId);
}

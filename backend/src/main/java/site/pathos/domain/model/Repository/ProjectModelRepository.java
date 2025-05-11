package site.pathos.domain.model.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.ProjectModel;

import java.util.List;

public interface ProjectModelRepository extends JpaRepository<ProjectModel, Long> {
    @Query("""
    SELECT pm
    FROM ProjectModel pm
    JOIN FETCH pm.model
    WHERE pm.project.id = :projectId
    ORDER BY pm.createdAt ASC
""")
    List<ProjectModel> findByProjectIdOrderByCreatedAt(@Param("projectId") Long projectId);
}

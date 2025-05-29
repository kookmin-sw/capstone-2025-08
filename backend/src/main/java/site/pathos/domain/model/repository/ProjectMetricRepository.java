package site.pathos.domain.model.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.ProjectMetric;
import site.pathos.domain.project.entity.Project;

@Repository
public interface ProjectMetricRepository extends JpaRepository<ProjectMetric, Long> {
    List<ProjectMetric> findAllByProject(Project project);
}

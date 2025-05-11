package site.pathos.domain.model.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.model.entity.ProjectModel;

public interface ProjectModelRepository extends JpaRepository<ProjectModel, Long> {
}

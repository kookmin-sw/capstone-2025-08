package site.pathos.domain.annotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.project.entity.ProjectLabel;

import java.util.List;
import java.util.Optional;

public interface ProjectLabelRepository extends JpaRepository<ProjectLabel, Long> {
    List<ProjectLabel> findAllByProjectId(Long projectId);

    Optional<ProjectLabel> findByProjectIdAndLabelId(Long projectId, Long labelId);
}

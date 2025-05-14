package site.pathos.domain.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.label.entity.ProjectLabel;

import java.util.List;
import java.util.Optional;

public interface ProjectLabelRepository extends JpaRepository<ProjectLabel, Long> {
    List<ProjectLabel> findAllByProjectId(Long projectId);

    Optional<ProjectLabel> findByProjectIdAndLabelId(Long projectId, Long labelId);
}

package site.pathos.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.project.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}

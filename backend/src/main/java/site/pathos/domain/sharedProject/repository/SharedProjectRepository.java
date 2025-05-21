package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.sharedProject.entity.SharedProject;

public interface SharedProjectRepository extends JpaRepository<SharedProject, Long> {
}

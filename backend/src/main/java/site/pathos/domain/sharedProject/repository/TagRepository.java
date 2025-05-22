package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.sharedProject.entity.Tag;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findAllBySharedProjectId(Long sharedProjectId);
}

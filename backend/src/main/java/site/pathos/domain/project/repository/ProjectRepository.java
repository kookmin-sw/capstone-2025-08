package site.pathos.domain.project.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.project.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Page<Project> findAllByOrderByUpdatedAtDesc(Pageable pageable);
    Page<Project> findByTitleContainingIgnoreCaseOrderByUpdatedAtDesc(String title, Pageable pageable);

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN FETCH p.subProjects sp
        WHERE p.id IN :ids
    """)
    List<Project> fetchProjectsWithSubProjectsByIds(@Param("ids") List<Long> ids);
}

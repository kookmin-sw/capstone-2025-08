package site.pathos.domain.project.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.user.entity.User;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Page<Project> findAllByUser(User user, Pageable pageable);
    Page<Project> findByTitleContainingIgnoreCaseAndUser(String title, User user, Pageable pageable);

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN FETCH p.subProjects sp
        WHERE p.id IN :ids
    """)
    List<Project> fetchProjectsWithSubProjectsByIds(@Param("ids") List<Long> ids);

    @Query("""
    SELECT p FROM Project p
    JOIN FETCH p.user
    WHERE p.id = (
        SELECT sp.project.id FROM SubProject sp WHERE sp.id = :subProjectId
    )
""")
    Project findProjectWithUserBySubProjectId(@Param("subProjectId") Long subProjectId);

    @Query("""
    SELECT p FROM Project p
    WHERE p.id = (
        SELECT sp.project.id FROM SubProject sp WHERE sp.id = :subProjectId
    )
""")
    Optional<Project> findBySubProjectId(@Param("subProjectId") Long subProjectId);

    List<Project> findAllByUserId(Long userId);

    @Query("SELECT p FROM Project p JOIN FETCH p.user WHERE p.id = :projectId")
    Optional<Project> findByIdWithUser(Long projectId);
}

package site.pathos.domain.project.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.dto.response.SubProjectSummaryDto;
import site.pathos.domain.project.entity.SubProject;

public interface SubProjectRepository extends JpaRepository<SubProject, Long> {

    @Query("""
        SELECT sp FROM SubProject sp
        LEFT JOIN FETCH sp.annotationHistories ah
        WHERE sp IN :subProjects
    """)
    List<SubProject> fetchWithAnnotationHistories(@Param("subProjects") List<SubProject> subProjects);

    @Query("""
            SELECT DISTINCT sp FROM SubProject sp
            LEFT JOIN FETCH sp.annotationHistories ah
            WHERE sp.project = :project and sp.isDeleted = false
        """)
    List<SubProject> findSubProjectsByProject(Project project);

    boolean existsByProjectIdAndIsUploadCompleteFalse(Long projectId);

    List<SubProject> findAllByProjectId(Long projectId);

    List<SubProject> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}

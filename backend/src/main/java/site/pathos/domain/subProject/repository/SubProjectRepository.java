package site.pathos.domain.subProject.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;
import site.pathos.domain.subProject.entity.SubProject;

public interface SubProjectRepository extends JpaRepository<SubProject, Long> {
    @Query("SELECT new site.pathos.domain.subProject.dto.response.SubProjectSummaryDto(sp.id, sp.thumbnailUrl, sp.isUploadComplete) " +
            "FROM SubProject sp WHERE sp.project.id = :projectId")
    List<SubProjectSummaryDto> findSubProjectIdAndThumbnailByProjectId(@Param("projectId") Long projectId);

    @Query("""
        SELECT sp FROM SubProject sp
        LEFT JOIN FETCH sp.annotationHistories ah
        LEFT JOIN FETCH ah.model
        WHERE sp IN :subProjects
    """)
    List<SubProject> fetchWithAnnotationHistoriesAndModels(@Param("subProjects") List<SubProject> subProjects);

    @Query("""
            SELECT DISTINCT sp FROM SubProject sp
            LEFT JOIN FETCH sp.annotationHistories ah
            WHERE sp.project = :project and sp.isDeleted = false
        """)
    List<SubProject> findSubProjectsByProject(Project project);

    boolean existsByProjectIdAndIsUploadCompleteFalse(Long projectId);

    List<SubProject> findAllByProjectId(Long projectId);
}

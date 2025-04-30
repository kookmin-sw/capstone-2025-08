package site.pathos.domain.subProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;
import site.pathos.domain.subProject.entity.SubProject;

import java.util.List;

public interface SubProjectRepository extends JpaRepository<SubProject, Long> {
    @Query("SELECT s.project FROM SubProject s WHERE s.id = :subProjectId")
    Project findProjectBySubProjectId(@Param("subProjectId") Long subProjectId);

    @Query("SELECT new site.pathos.domain.subProject.dto.response.SubProjectSummaryDto(sp.id, sp.thumbnailUrl) " +
            "FROM SubProject sp WHERE sp.project.id = :projectId")
    List<SubProjectSummaryDto> findSubProjectIdAndThumbnailByProjectId(@Param("projectId") Long projectId);
}

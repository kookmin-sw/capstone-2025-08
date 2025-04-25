package site.pathos.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import site.pathos.domain.project.dto.response.ProjectDetailDto;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;
import site.pathos.domain.subProject.repository.SubProjectRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final SubProjectRepository subProjectRepository;

    public ProjectDetailDto getProjectDetail(Long projectId){
        List<SubProjectSummaryDto> subProjects = subProjectRepository.findSubProjectIdAndThumbnailByProjectId(projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found: id = " + projectId));

        return new ProjectDetailDto(
                projectId,
                project.getTitle(),
                subProjects
        );
    }
}

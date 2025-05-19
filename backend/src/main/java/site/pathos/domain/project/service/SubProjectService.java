package site.pathos.domain.project.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.entity.SubProject;
import site.pathos.domain.project.event.ProjectSvsUploadCompletedEvent;
import site.pathos.domain.project.repository.SubProjectRepository;

@Service
@RequiredArgsConstructor
public class SubProjectService {

    private final SubProjectRepository subProjectRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void markTilingAsComplete(Long subProjectId){
        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new IllegalArgumentException("SubProject not found: " + subProjectId));

        subProject.markTilingCompleted();

        if (isAllSubProjectsSvsUploadCompleted(subProject)) {
            publishProjectSvsUploadCompletedEvent(subProject);
        }
    }

    private boolean isAllSubProjectsSvsUploadCompleted(SubProject subProject) {
        Long projectId = subProject.getProject().getId();
        List<SubProject> subProjects = subProjectRepository.findAllByProjectId(projectId);

        return subProjects.stream().allMatch(SubProject::isUploadComplete);
    }

    private void publishProjectSvsUploadCompletedEvent(SubProject subProject) {
        Project project = subProject.getProject();
        if (project.isDeleted()) {
            return;
        }

        eventPublisher.publishEvent(
                new ProjectSvsUploadCompletedEvent(
                        project.getUser(),
                        project.getId(),
                        project.getTitle()
                )
        );
    }
}

package site.pathos.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.Repository.ProjectModelRepository;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.project.entity.SubProject;
import site.pathos.domain.project.repository.SubProjectRepository;
import site.pathos.domain.model.Repository.UserModelRepository;

@Service
@RequiredArgsConstructor
public class SubProjectService {

    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final UserModelRepository userModelRepository;
    private final SubProjectRepository subProjectRepository;
    private final ProjectModelRepository projectModelRepository;
    private final ProjectRepository projectRepository;
    private final ModelRepository modelRepository;


    @Transactional
    public void markTilingAsComplete(Long subProjectId){
        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new IllegalArgumentException("SubProject not found: " + subProjectId));

        subProject.markTilingCompleted();
    }
}

package site.pathos.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.repository.ModelRepository;
import site.pathos.domain.model.repository.ProjectModelRepository;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.project.entity.SubProject;
import site.pathos.domain.project.repository.SubProjectRepository;
import site.pathos.domain.model.repository.UserModelRepository;

@Service
@RequiredArgsConstructor
public class SubProjectService {

    private final SubProjectRepository subProjectRepository;

    @Transactional
    public void markTilingAsComplete(Long subProjectId){
        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new IllegalArgumentException("SubProject not found: " + subProjectId));

        subProject.markTilingCompleted();
    }
}

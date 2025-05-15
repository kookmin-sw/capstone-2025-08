package site.pathos.domain.subProject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistorySummaryDto;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.ModelSummaryDto;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.Repository.ProjectModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.subProject.dto.response.SubProjectResponseDto;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.domain.userModel.repository.UserModelRepository;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

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

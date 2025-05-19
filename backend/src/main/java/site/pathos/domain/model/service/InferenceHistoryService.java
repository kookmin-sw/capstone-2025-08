package site.pathos.domain.model.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.model.entity.InferenceHistory;
import site.pathos.domain.model.repository.InferenceHistoryRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.project.entity.Project;

@Service
@RequiredArgsConstructor
public class InferenceHistoryService {

    private final InferenceHistoryRepository inferenceHistoryRepository;

    @Transactional
    public InferenceHistory createInferenceHistory(Project project, Model model) {
        InferenceHistory inferenceHistory = InferenceHistory.builder()
                .project(project)
                .model(model)
                .build();

        return inferenceHistoryRepository.save(inferenceHistory);
    }
}

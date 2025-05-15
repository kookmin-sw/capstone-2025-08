package site.pathos.domain.model.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.model.entity.TrainingHistory;
import site.pathos.domain.model.Repository.TrainingHistoryRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.project.entity.Project;

@Service
@RequiredArgsConstructor
public class TrainingHistoryService {

    private final TrainingHistoryRepository trainingHistoryRepository;

    @Transactional
    public TrainingHistory createTrainingHistory(Project project, Model model) {
        TrainingHistory trainingHistory = TrainingHistory.builder()
                .project(project)
                .model(model)
                .build();

        return trainingHistoryRepository.save(trainingHistory);
    }
}
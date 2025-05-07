package site.pathos.domain.inferenceHistory.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.inferenceHistory.entity.InferenceHistory;
import site.pathos.domain.inferenceHistory.repository.InferenceHistoryRepository;

@Service
@RequiredArgsConstructor
public class InferenceHistoryService {
    private final InferenceHistoryRepository inferenceHistoryRepository;

    @Transactional
    public void saveInferenceHistory(AnnotationHistory annotationHistory){
        InferenceHistory inferenceHistory = InferenceHistory.builder()
                .annotationHistory(annotationHistory)
                .build();

        inferenceHistoryRepository.save(inferenceHistory);
    }

    @Transactional
    public void updateInferenceHistory(Long annotationHistoryId, float accuracy, float loss, float loopPerformance) {
        InferenceHistory history = inferenceHistoryRepository.findByAnnotationHistoryId(annotationHistoryId)
                .orElseThrow(() -> new RuntimeException("InferenceHistory not found"));

        history.updateResult(accuracy, loss, loopPerformance);
    }
}

package site.pathos.domain.annotationHistory.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;

@Service
@RequiredArgsConstructor
public class AnnotationHistoryService {

    private final AnnotationHistoryRepository annotationHistoryRepository;

    @Transactional
    public void updateModelName(Long annotationHistoryId, String newModelName) {
        AnnotationHistory history = annotationHistoryRepository.findById(annotationHistoryId)
                .orElseThrow(() -> new IllegalArgumentException("AnnotationHistory not found"));

        history.updateModelName(newModelName);
    }
}
package site.pathos.domain.model.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.ModelType;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelRepository modelRepository;

    @Transactional
    public void saveModel(AnnotationHistory history, String modelName, ModelType modelType, String modelPath){
        Model model = Model.builder()
                .annotationHistory(history)
                .name(modelName)
                .modelType(modelType)
                .modelPath(modelPath)
                .build();

        modelRepository.save(model);
    }
}

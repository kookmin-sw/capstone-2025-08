package site.pathos.domain.model.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.model.entity.TrainingHistory;
import site.pathos.domain.model.repository.ModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.enums.ModelType;

@Service
@RequiredArgsConstructor
public class ModelService {
    private final ModelRepository modelRepository;

    @Transactional
    public Model saveModel(TrainingHistory trainingHistory, String modelName,
                           ModelType modelType, String tissueModelPath, String cellModelPath){
        Model model = Model.builder()
                .trainingHistory(trainingHistory)
                .name(modelName)
                .modelType(modelType)
                .tissueModelPath(tissueModelPath)
                .cellModelPath(cellModelPath)
                .build();

        return modelRepository.save(model);
    }
}

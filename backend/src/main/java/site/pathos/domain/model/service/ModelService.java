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

}

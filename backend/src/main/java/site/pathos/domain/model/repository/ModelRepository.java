package site.pathos.domain.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.enums.ModelType;

import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    Optional<Model> findFirstByTrainingHistoryIsNullAndModelTypeAndTissueModelPathIsNotNullAndCellModelPathIsNullOrderByTrainedAtDesc(ModelType modelType);

    Optional<Model> findFirstByTrainingHistoryIsNullAndModelTypeAndCellModelPathIsNotNullAndTissueModelPathIsNullOrderByTrainedAtDesc(ModelType modelType);

    Optional<Model> findFirstByTrainingHistoryIsNullAndModelTypeAndCellModelPathIsNotNullAndTissueModelPathIsNotNullOrderByTrainedAtDesc(ModelType modelType);
}

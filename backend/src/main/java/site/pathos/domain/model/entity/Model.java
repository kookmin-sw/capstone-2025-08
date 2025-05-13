package site.pathos.domain.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.inferenceHistory.entity.TrainingHistory;

import java.time.LocalDateTime;

@Entity
@Table(name = "model")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Model {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_history_id")
    private TrainingHistory trainingHistory;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "model_type", nullable = false)
    private ModelType modelType;

    @Column(name = "tissue_model_path")
    private String tissueModelPath;

    @Column(name = "cell_model_path")
    private String cellModelPath;

    @CreationTimestamp
    @Column(name = "trained_at", nullable = false)
    private LocalDateTime trainedAt;

    @Builder
    public Model(TrainingHistory trainingHistory, String name,
                 ModelType modelType, String tissueModelPath, String cellModelPath) {
        this.trainingHistory = trainingHistory;
        this.name = name;
        this.modelType = modelType;

        if (modelType == ModelType.CELL) {
            if (cellModelPath == null) {
                throw new IllegalArgumentException("SINGLE_CELL 모델은 cellModelPath가 필요합니다.");
            }
            this.cellModelPath = cellModelPath;
            this.tissueModelPath = null;
        } else if (modelType == ModelType.TISSUE) {
            if (tissueModelPath == null) {
                throw new IllegalArgumentException("SINGLE_TISSUE 모델은 tissueModelPath가 필요합니다.");
            }
            this.tissueModelPath = tissueModelPath;
            this.cellModelPath = null;

        } else if (modelType == ModelType.MULTI) {
            if (cellModelPath == null || tissueModelPath == null) {
                throw new IllegalArgumentException("MULTI 모델은 cellModelPath와 tissueModelPath 모두 필요합니다.");
            }
            this.cellModelPath = cellModelPath;
            this.tissueModelPath = tissueModelPath;
        } else {
            throw new IllegalArgumentException("지원하지 않는 ModelType입니다: " + modelType);
        }
    }
}

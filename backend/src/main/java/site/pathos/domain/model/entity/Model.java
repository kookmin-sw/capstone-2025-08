package site.pathos.domain.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.model.enums.ModelType;

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
;
    @Column(name = "cell_model_path")
    private String cellModelPath;

    @CreationTimestamp
    @Column(name = "trained_at")
    private LocalDateTime trainedAt;

    @Builder
    public Model(String name,
                 ModelType modelType, String tissueModelPath, String cellModelPath) {
        this.name = name;
        this.modelType = modelType;
        this.tissueModelPath = tissueModelPath;
        this.cellModelPath = cellModelPath;
    }

    public void saveResult(TrainingHistory trainingHistory, String tissueModelPath, String cellModelPath){
        this.trainingHistory = trainingHistory;
        this.tissueModelPath = tissueModelPath;
        this.cellModelPath = cellModelPath;
    }
}

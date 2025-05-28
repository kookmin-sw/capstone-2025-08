package site.pathos.domain.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.project.entity.Project;

import java.time.LocalDateTime;

@Entity
@Table(name = "inferece_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InferenceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_model_id", nullable = false)
    private Model baseModel;

    @Column(name = "accuracy")
    private Float accuracy;

    @Column(name = "loss")
    private Float loss;

    @Column(name = "loop_performance")
    private Float loopPerformance;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Builder
    public InferenceHistory(Project project, Model model){
        this.project = project;
        this.baseModel = model;
    }


    public void updateResult(float accuracy, float loss, float loopPerformance) {
        this.accuracy = accuracy;
        this.loss = loss;
        this.loopPerformance = loopPerformance;
        this.completedAt = LocalDateTime.now();
    }
}

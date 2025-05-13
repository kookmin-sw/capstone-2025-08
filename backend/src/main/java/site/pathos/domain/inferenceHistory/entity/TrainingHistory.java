package site.pathos.domain.inferenceHistory.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.project.entity.Project;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TrainingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_model_id", nullable = false)
    private Model baseModel;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Builder
    public TrainingHistory(Project project, Model model){
        this.project = project;
        this.baseModel = model;
    }
}

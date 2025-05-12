package site.pathos.domain.annotationHistory.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.subProject.entity.SubProject;

import java.time.LocalDateTime;

@Entity
@Table(name = "annotation_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AnnotationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_project_id", nullable = false)
    private SubProject subProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    private Model model;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @CreationTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Builder
    public AnnotationHistory(SubProject subProject, Model model, String modelName) {
        this.subProject = subProject;
        this.model = model;
        this.modelName = modelName;
    }

    public void updateModelName(String newName) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("Model name must not be empty");
        }
        this.modelName = newName;
    }
}

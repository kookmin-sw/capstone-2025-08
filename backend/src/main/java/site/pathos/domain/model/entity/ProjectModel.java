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
@Table(
        name = "project_model",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "model_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @Column(name = "is_initial", nullable = false)
    private boolean isInitial;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ProjectModel(Project project, String name, Model model, boolean isInitial){
        this.name = name;
        this.project = project;
        this.model = model;
        this.isInitial = isInitial;
    }
}

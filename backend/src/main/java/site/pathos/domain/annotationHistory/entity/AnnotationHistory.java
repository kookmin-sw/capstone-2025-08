package site.pathos.domain.annotationHistory.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.model.entitiy.Model;
import site.pathos.domain.subProject.SubProject;

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
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

package site.pathos.domain.model.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;

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
    @JoinColumn(name = "annotation_history_id")
    private AnnotationHistory annotationHistory;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "model_path", nullable = false)
    private String modelPath;

    @CreationTimestamp
    @Column(name = "trained_at", nullable = false)
    private LocalDateTime trainedAt;

    @Builder
    public Model(AnnotationHistory annotationHistory, String name, String modelPath) {
        this.annotationHistory = annotationHistory;
        this.name = name;
        this.modelPath = modelPath;
    }
}

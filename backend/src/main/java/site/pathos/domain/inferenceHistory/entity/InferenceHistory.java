package site.pathos.domain.inferenceHistory.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

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
    @JoinColumn(name = "annotation_history_id", nullable = false)
    private InferenceHistory inferenceHistory;

    @Column(name = "accuracy")
    private Float accuracy;

    @Column(name = "loss")
    private Float loss;

    @Column(name = "loop_performance")
    private Float loop_performance;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

package site.pathos.domain.roi.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;

@Entity
@Table(name = "roi")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Roi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "annotation_history_id", nullable = false)
    private AnnotationHistory annotationHistory;

    @Column(name = "x", nullable = false)
    private int x;

    @Column(name = "y", nullable = false)
    private int y;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;
}

package site.pathos.domain.roi.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "roi", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TissueAnnotation> tissueAnnotations = new ArrayList<>();

    @Column(name = "x", nullable = false)
    private int x;

    @Column(name = "y", nullable = false)
    private int y;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;

    @Column(name = "faulty")
    private Double faulty;

    @Builder
    public Roi(AnnotationHistory annotationHistory, int x, int y, int width, int height) {
        if (annotationHistory == null) throw new IllegalArgumentException("annotationHistory cannot be null");

        this.annotationHistory = annotationHistory;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public void changeCoordinates(int x, int y, int width, int height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

package site.pathos.domain.annotation.tissueAnnotation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.roi.entity.Roi;

@Entity
@Table(name = "cell_annotation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CellAnnotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roi_id", nullable = false)
    private Roi roi;

    @Column(name = "x", nullable = false)
    private int x;

    @Column(name = "y", nullable = false)
    private int y;

    @Column(name = "radius", nullable = false)
    private float radius;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "label", nullable = false)
    private String label;
}

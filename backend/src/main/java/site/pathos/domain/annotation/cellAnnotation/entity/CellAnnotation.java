package site.pathos.domain.annotation.cellAnnotation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.roi.entity.Roi;

import java.util.List;

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

    @Column(name = "class_index", nullable = false)
    private int classIndex;

    @Column(name = "color", nullable = false)
    private String color;

    @ElementCollection
    @CollectionTable(name = "cell_annotation_point",
            joinColumns = @JoinColumn(name = "cell_annotation_id"))
    private List<Point> polygon;

    @Embeddable
    @Getter
    @NoArgsConstructor
    public static class Point {
        private int x;
        private int y;

        @Builder
        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }

    @Builder
    public CellAnnotation(Roi roi, int classIndex, String color, List<Point> polygon){
        this.roi = roi;
        this.classIndex = classIndex;
        this.color = color;
        this.polygon = polygon;
    }
}

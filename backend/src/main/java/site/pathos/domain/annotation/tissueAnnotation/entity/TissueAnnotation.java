package site.pathos.domain.annotation.tissueAnnotation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.roi.entity.Roi;

@Entity
@Table(name = "TissueAnnotation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TissueAnnotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roi_id", nullable = false)
    private Roi roi;

    @Column(name = "annotation_image_url", nullable = false)
    private String annotationImagePath;

    @Builder
    public TissueAnnotation(Roi roi, String annotationImagePath){
        if (roi == null) throw new IllegalArgumentException("roi cannot be null in TissueAnnotation");

        this.roi = roi;
        this.annotationImagePath = annotationImagePath;
    }
}

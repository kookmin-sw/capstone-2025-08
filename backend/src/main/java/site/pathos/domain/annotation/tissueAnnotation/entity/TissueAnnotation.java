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

    @Column(name = "annotation_image_path", nullable = false)
    private String annotationImagePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "annotation_type", nullable = false)
    private AnnotationType annotationType;

    @Column(name = "is_upload_complete", nullable = false)
    private boolean isUploadComplete;

    @Builder
    public TissueAnnotation(Roi roi, String annotationImagePath, AnnotationType annotationType) {
        if (roi == null) throw new IllegalArgumentException("roi cannot be null in TissueAnnotation");
        if (annotationType == null) throw new IllegalArgumentException("annotationType is required");

        this.roi = roi;
        this.annotationImagePath = annotationImagePath;
        this.annotationType = annotationType;
        this.isUploadComplete = false;
    }

    public void uploadComplete() {
        this.isUploadComplete = true;
    }
}

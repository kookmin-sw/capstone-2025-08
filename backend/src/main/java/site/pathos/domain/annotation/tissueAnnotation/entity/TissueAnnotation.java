package site.pathos.domain.annotation.tissueAnnotation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roi_id", nullable = false)
    private Roi roi;

    @Column(name = "annoation_image_url", nullable = false)
    private String annotationImageUrl;
}

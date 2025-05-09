package site.pathos.domain.annotation.tissueAnnotation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.tissueAnnotation.entity.AnnotationType;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.tissueAnnotation.repository.TissueAnnotationRepository;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.roi.repository.RoiRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.util.image.ImageTile;
import site.pathos.global.util.image.ImageUtils;

import java.awt.image.BufferedImage;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TissueAnnotationService {

    private final S3Service s3Service;
    private final TissueAnnotationRepository tissueAnnotationRepository;
    private final RoiRepository roiRepository;

    public void uploadTissueAnnotations(Long subProjectId, Long annotationHistoryId, Long roiId, List<MultipartFile> images) {
        Roi roi = roiRepository.findById(roiId)
                .orElseThrow(() -> new RuntimeException("ROI not found: " + roiId));

        uploadTiles(subProjectId, annotationHistoryId, roi, images);
        uploadMergedImage(subProjectId, annotationHistoryId, roi, images);
    }

    private void uploadTiles(Long subProjectId, Long annotationHistoryId, Roi roi, List<MultipartFile> images) {
        for (MultipartFile image : images) {
            String originalFilename = image.getOriginalFilename().replaceAll("\\s+", "_");
            String key = "sub-project/" + subProjectId
                    + "/annotation-history/" + annotationHistoryId
                    + "/roi-" + roi.getId() + "/train/" + originalFilename;

            s3Service.uploadFile(key, image);

            TissueAnnotation ta = TissueAnnotation.builder()
                    .roi(roi)
                    .annotationImageUrl(key)
                    .annotationType(AnnotationType.TILE)
                    .build();

            tissueAnnotationRepository.save(ta);
        }
    }

    private void uploadMergedImage(Long subProjectId, Long annotationHistoryId, Roi roi, List<MultipartFile> images) {
        try {
            int totalWidth = roi.getWidth();
            int totalHeight = roi.getHeight();

            BufferedImage merged = ImageUtils.mergeTiles(images, totalWidth, totalHeight);

            String mergedKey = "sub-project/" + subProjectId
                    + "/annotation-history/" + annotationHistoryId
                    + "/roi-" + roi.getId() + "/merged.png";

            s3Service.uploadBufferedImage(merged, mergedKey);

            TissueAnnotation mergedAnnotation = TissueAnnotation.builder()
                    .roi(roi)
                    .annotationImageUrl(mergedKey)
                    .annotationType(AnnotationType.MERGED)
                    .build();

            tissueAnnotationRepository.save(mergedAnnotation);

        } catch (Exception e) {
            throw new RuntimeException("병합 이미지 업로드 실패", e);
        }
    }

    @Transactional
    public void saveResultAnnotation(Roi roi, String imagePath) {
        BufferedImage resultImage = s3Service.downloadBufferedImage(imagePath);

        List<ImageTile> tiles = ImageUtils.sliceImageByROIWithPosition(
                resultImage,
                roi.getX(),
                roi.getY(),
                roi.getWidth(),
                roi.getHeight()
        );

        for (ImageTile tile : tiles) {
            String tileKey = "sub-project/" + roi.getAnnotationHistory().getSubProject().getId() +
                    "/annotation-history/" + roi.getAnnotationHistory().getId() +
                    "/roi-" + roi.getId() +
                    "/result/" + tile.row() + "_" + tile.col() + ".png";

            s3Service.uploadBufferedImage(tile.image(), tileKey);

            TissueAnnotation tileAnnotation = TissueAnnotation.builder()
                    .roi(roi)
                    .annotationImageUrl(tileKey)
                    .annotationType(AnnotationType.RESULT_TILE)
                    .build();

            tissueAnnotationRepository.save(tileAnnotation);
        }
    }
}

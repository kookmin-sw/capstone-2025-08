package site.pathos.domain.annotation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.enums.AnnotationType;
import site.pathos.domain.annotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.repository.TissueAnnotationRepository;
import site.pathos.domain.annotation.entity.Roi;
import site.pathos.domain.annotation.repository.RoiRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.util.image.ImageTile;
import site.pathos.global.util.image.ImageUtils;

import java.awt.image.BufferedImage;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TissueAnnotationService {

    private final S3Service s3Service;
    private final TissueAnnotationRepository tissueAnnotationRepository;
    private final RoiRepository roiRepository;

    public void uploadTissueAnnotations(Long subProjectId, Long annotationHistoryId, Roi roi, List<MultipartFile> images) {

        uploadTiles(subProjectId, annotationHistoryId, roi, images);
        uploadMergedImage(subProjectId, annotationHistoryId, roi, images);
    }

    private void uploadTiles(Long subProjectId, Long annotationHistoryId, Roi roi, List<MultipartFile> images) {
        for (MultipartFile image : images) {
            String originalFilename = image.getOriginalFilename().replaceAll("\\s+", "_");

            String fixedFilename = originalFilename.replaceFirst("^-?\\d+", String.valueOf(roi.getId()));

            String key = "sub-project/" + subProjectId
                    + "/annotation-history/" + annotationHistoryId
                    + "/roi/" + roi.getId() + "/tile/" + fixedFilename;


            TissueAnnotation ta = TissueAnnotation.builder()
                    .roi(roi)
                    .annotationImagePath(key)
                    .annotationType(AnnotationType.TILE)
                    .build();
            tissueAnnotationRepository.save(ta);

            s3Service.uploadFile(key, image);
            ta.uploadComplete();
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
                    + "/roi/" + roi.getId() + "/merged.png";

            TissueAnnotation mergedAnnotation = TissueAnnotation.builder()
                    .roi(roi)
                    .annotationImagePath(mergedKey)
                    .annotationType(AnnotationType.MERGED)
                    .build();

            tissueAnnotationRepository.save(mergedAnnotation);

            s3Service.uploadBufferedImageAsync(merged, mergedKey,
                    () -> {
                        mergedAnnotation.uploadComplete();
                        tissueAnnotationRepository.save(mergedAnnotation);
                    },
                    ex -> {
                        log.error("이미지 업로드 실패: {}", mergedKey, ex);
                    }
            );

        } catch (Exception e) {
            throw new RuntimeException("병합 이미지 업로드 실패", e);
        }
    }

    @Transactional
    public void saveResultAnnotation(Roi roi, String imagePath) {
        BufferedImage resultImage = s3Service.downloadBufferedImage(imagePath);

        // 1. MERGED 타입 업로드 및 저장
        String mergedKey = "sub-project/" + roi.getAnnotationHistory().getSubProject().getId() +
                "/annotation-history/" + roi.getAnnotationHistory().getId() +
                "/roi" + roi.getId() + "/merged.png";

        s3Service.uploadBufferedImage(resultImage, mergedKey);

        TissueAnnotation mergedAnnotation = TissueAnnotation.builder()
                .roi(roi)
                .annotationImagePath(mergedKey)
                .annotationType(AnnotationType.MERGED)
                .build();

        tissueAnnotationRepository.save(mergedAnnotation);

        // 2. TILE 타입 업로드 및 저장
        List<ImageTile> tiles = ImageUtils.sliceImageByROIWithPosition(
                resultImage,
                roi.getWidth(),
                roi.getHeight()
        );

        for (ImageTile tile : tiles) {
            String tileKey = "sub-project/" + roi.getAnnotationHistory().getSubProject().getId() +
                    "/annotation-history/" + roi.getAnnotationHistory().getId() +
                    "/roi" + roi.getId() + "/tile/" + roi.getId() +
                    "_" + tile.row() + "_" + tile.col() + ".png";

            s3Service.uploadBufferedImage(tile.image(), tileKey);

            TissueAnnotation tileAnnotation = TissueAnnotation.builder()
                    .roi(roi)
                    .annotationImagePath(tileKey)
                    .annotationType(AnnotationType.TILE)
                    .build();

            tissueAnnotationRepository.save(tileAnnotation);
        }
    }

    @Transactional
    public void deleteTissueAnnotationsByRoiId(Long roiId) {
        List<TissueAnnotation> annotations = tissueAnnotationRepository.findByRoiId(roiId);

        if (annotations.isEmpty()) {
            log.warn("No TissueAnnotations found for ROI ID: {}", roiId);
            return;
        }

        for (TissueAnnotation annotation : annotations) {
            String key = annotation.getAnnotationImagePath();

            try {
                s3Service.deleteFile(key);
                log.info("S3 이미지 삭제 완료: {}", key);
            } catch (Exception e) {
                log.error("S3 이미지 삭제 실패: {}", key, e);
            }
            annotation.getRoi().getTissueAnnotations().remove(annotation);
        }

        log.info("ROI ID {} 관련 TissueAnnotation 모두 삭제 완료", roiId);
    }
}

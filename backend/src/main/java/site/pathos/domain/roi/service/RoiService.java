package site.pathos.domain.roi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.tissueAnnotation.service.TissueAnnotationService;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.modelServer.dto.request.RoiPayload;
import site.pathos.domain.roi.dto.request.RoiSaveRequestDto;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.roi.repository.RoiRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoiService {

    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final RoiRepository roiRepository;
    private final TissueAnnotationService tissueAnnotationService;

    @Transactional
    public void saveWithAnnotations(Long subProjectId, Long annotationHistoryId, List<RoiSaveRequestDto> rois, List<MultipartFile> images) {
        AnnotationHistory history = annotationHistoryRepository.findById(annotationHistoryId)
                .orElseThrow(() -> new IllegalArgumentException("AnnotationHistory not found"));

        for(RoiSaveRequestDto roiDto : rois){
            Roi roi = upsertRoi(history, roiDto);

            List<MultipartFile> matchedImages = images.stream()
                    .filter(img -> roiDto.getImageNames().contains(img.getOriginalFilename()))
                    .toList();

            tissueAnnotationService.uploadTissueAnnotations(
                    subProjectId,
                    annotationHistoryId,
                    roi.getId(),
                    matchedImages
            );
        }
    }

    private Roi upsertRoi(AnnotationHistory history, RoiSaveRequestDto roiDto) {
        if (roiDto.getRoiId() != null) {
            //기존에 존재하던 roi를 수정한 경우
            Roi roi = roiRepository.findById(roiDto.getRoiId())
                    .orElseThrow(() -> new RuntimeException("ROI not found: " + roiDto.getRoiId()));
            roi.changeCoordinates(
                    roiDto.getX(),
                    roiDto.getY(),
                    roiDto.getWidth(),
                    roiDto.getHeight()
            );
            return roi;
        } else {
            //새로 생긴 roi의 경우
            Roi roi = Roi.builder()
                    .annotationHistory(history)
                    .x(roiDto.getX())
                    .y(roiDto.getY())
                    .width(roiDto.getWidth())
                    .height(roiDto.getHeight())
                    .build();
            return roiRepository.save(roi);
        }
    }

    @Transactional
    public void saveResultRois(Long annotationHistoryId, List<RoiPayload> roiPayloads) {
        AnnotationHistory history = annotationHistoryRepository.findById(annotationHistoryId)
                .orElseThrow(() -> new IllegalArgumentException("AnnotationHistory not found"));

        AnnotationHistory newHistory = AnnotationHistory.builder()
                .subProject(history.getSubProject())
                .model(history.getModel())
                .modelName(history.getModelName())
                .build();

        annotationHistoryRepository.save(newHistory);

        for (RoiPayload payload : roiPayloads) {
            Roi roi = Roi.builder()
                    .annotationHistory(newHistory)
                    .x(payload.detail().x())
                    .y(payload.detail().y())
                    .width(payload.detail().width())
                    .height(payload.detail().height())
                    .build();
            Roi savedRoi = roiRepository.save(roi);

            tissueAnnotationService.saveResultAnnotation(savedRoi, payload.tissue_path());
        }
    }
}

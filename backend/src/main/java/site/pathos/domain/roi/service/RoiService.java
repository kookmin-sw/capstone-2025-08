package site.pathos.domain.roi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.tissueAnnotation.service.TissueAnnotationService;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.label.dto.LabelDto;
import site.pathos.domain.label.service.LabelService;
import site.pathos.domain.roi.dto.request.RoiRequestPayload;
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
    private final LabelService labelService;

    @Transactional
    public void saveWithAnnotations(Long subProjectId, Long annotationHistoryId,
                                    List<RoiSaveRequestDto> rois, List<MultipartFile> images, List<LabelDto> labels) {
        AnnotationHistory history = annotationHistoryRepository.findById(annotationHistoryId)
                .orElseThrow(() -> new IllegalArgumentException("AnnotationHistory not found"));

        for(RoiSaveRequestDto roiDto : rois){
            List<MultipartFile> matchedImages = images.stream()
                    .filter(img -> roiDto.getImageNames().contains(img.getOriginalFilename()))
                    .toList();
            if (roiDto.getRoiId() != null) {
                Roi roi = updateRoi(roiDto);
                tissueAnnotationService.deleteTissueAnnotationsByRoiId(roi.getId());
                tissueAnnotationService.uploadTissueAnnotations(
                        subProjectId,
                        annotationHistoryId,
                        roi.getId(),
                        matchedImages
                );
            } else {
                Roi roi = createRoi(history, roiDto);
                tissueAnnotationService.uploadTissueAnnotations(
                        subProjectId,
                        annotationHistoryId,
                        roi.getId(),
                        matchedImages
                );
            }
        }

        //TODO: 라벨 저장 로직 필요
    }

    private Roi updateRoi(RoiSaveRequestDto roiDto) {
        Roi roi = roiRepository.findById(roiDto.getRoiId())
                .orElseThrow(() -> new RuntimeException("ROI not found: " + roiDto.getRoiId()));
        roi.changeCoordinates(
                roiDto.getX(),
                roiDto.getY(),
                roiDto.getWidth(),
                roiDto.getHeight()
        );
        return roi;
    }

    private Roi createRoi(AnnotationHistory history, RoiSaveRequestDto roiDto) {
        Integer max = roiRepository.findMaxDisplayOrderByAnnotationHistory(history.getId());
        int displayOrder = (max == null) ? 0 : max + 1;

        Roi roi = Roi.builder()
                .annotationHistory(history)
                .x(roiDto.getX())
                .y(roiDto.getY())
                .width(roiDto.getWidth())
                .height(roiDto.getHeight())
                .displayOrder(displayOrder)
                .build();
        return roiRepository.save(roi);
    }

    @Transactional
    public void saveResultRois(AnnotationHistory newHistory, List<RoiRequestPayload> roiPayloads) {
        for (RoiRequestPayload payload : roiPayloads) {
            Roi roi = Roi.builder()
                    .annotationHistory(newHistory)
                    .x(payload.detail().x())
                    .y(payload.detail().y())
                    .width(payload.detail().width())
                    .height(payload.detail().height())
                    .build();
            Roi savedRoi = roiRepository.save(roi);

            for (String path : payload.tissue_path()) {
                tissueAnnotationService.saveResultAnnotation(savedRoi, path);
            }
        }
    }
}

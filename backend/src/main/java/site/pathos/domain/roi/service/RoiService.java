package site.pathos.domain.roi.service;

import lombok.RequiredArgsConstructor;
import org.hibernate.validator.internal.constraintvalidators.bv.time.futureorpresent.FutureOrPresentValidatorForInstant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.tissueAnnotation.service.TissueAnnotationService;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.roi.dto.RoiSaveRequestDto;
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

        //TODO
        //updated_at 갱신 로직

        for(RoiSaveRequestDto roiDto : rois){
            Roi roi1 = upsertRoi(history, roiDto);

            // 2. ROI에 해당하는 이미지 리스트 추출
            List<MultipartFile> matchedImages = images.stream()
                    .filter(img -> roiDto.getImageNames().contains(img.getOriginalFilename()))
                    .toList();

            // 3. 해당 ROI에 대한 TissueAnnotation 저장 및 S3 업로드
            tissueAnnotationService.uploadTissueAnnotations(
                    subProjectId,
                    annotationHistoryId,
                    roiDto.getRoiId(),
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
}

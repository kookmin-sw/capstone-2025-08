package site.pathos.domain.annotationHistory.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.cellAnnotation.CellAnnotationRepository;
import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;
import site.pathos.domain.annotation.cellAnnotation.entity.CellAnnotation;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistoryResponseDto;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.roi.dto.request.RoiDetail;
import site.pathos.domain.roi.dto.request.RoiPayload;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.roi.repository.RoiRepository;
import site.pathos.global.aws.s3.S3Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnotationHistoryService {

    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final RoiRepository roiRepository;
    private final CellAnnotationRepository cellAnnotationRepository;
    private final ModelRepository modelRepository;

    private final S3Service s3Service;

    @Transactional
    public void updateModelName(Long annotationHistoryId, String newModelName) {
        AnnotationHistory history = annotationHistoryRepository.findById(annotationHistoryId)
                .orElseThrow(() -> new IllegalArgumentException("AnnotationHistory not found"));

        history.updateModelName(newModelName);
    }

    @Transactional(readOnly = true)
    public AnnotationHistoryResponseDto getAnnotationHistory(Long historyId) {
        AnnotationHistory history = annotationHistoryRepository.findWithSubProjectAndModelById(historyId)
                .orElseThrow(() -> new RuntimeException("AnnotationHistory not found"));

        // ROI만 조회 (TissueAnnotation, Cell은 나중에 개별 조회)
        List<Roi> rois = roiRepository.findAllByAnnotationHistoryId(history.getId());

        Model model = modelRepository.findByAnnotationHistoryId(historyId)
                .orElseThrow(() -> new RuntimeException("Model not found"));

        List<RoiPayload> roiPayloads = rois.stream()
                .map(roi -> {
                    // CellAnnotation 가져오기
                    List<CellAnnotation> cellAnnotations = cellAnnotationRepository.findAllByRoiId(roi.getId());

                    List<CellDetail> cellDetails = cellAnnotations.stream()
                            .map(ca -> new CellDetail(ca.getX(), ca.getY()))
                            .toList();

                    RoiDetail detail = new RoiDetail(roi.getX(), roi.getY(), roi.getWidth(), roi.getHeight());

                    // TissueAnnotation 중 클라이언트용(예: TILE or MERGED or RESULT_TILE 등)을 골라서 하나만 선택 (또는 여러 개면 리스트로)
                    List<String> presignedTissuePaths = roi.getTissueAnnotations().stream()
                            .map(TissueAnnotation::getAnnotationImagePath)
                            .map(s3Service::getPresignedUrl)
                            .toList();

                    return new RoiPayload(detail, presignedTissuePaths, cellDetails);
                })
                .toList();

        return new AnnotationHistoryResponseDto(
                history.getId(),
                history.getModelName(),
                model.getModelPath(),
                roiPayloads
        );
    }
}
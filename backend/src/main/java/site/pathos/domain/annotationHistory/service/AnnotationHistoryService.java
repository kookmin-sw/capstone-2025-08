package site.pathos.domain.annotationHistory.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.cellAnnotation.repository.CellAnnotationRepository;
import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;
import site.pathos.domain.annotation.cellAnnotation.entity.CellAnnotation;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistoryResponseDto;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.label.dto.LabelDto;
import site.pathos.domain.label.entity.Label;
import site.pathos.domain.label.repository.LabelRepository;
import site.pathos.domain.roi.dto.response.RoiResponseDto;
import site.pathos.domain.roi.dto.response.RoiResponsePayload;
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
    private final LabelRepository labelRepository;

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

        List<Roi> rois = roiRepository.findAllByAnnotationHistoryId(history.getId());

        List<RoiResponsePayload> roiPayloads = rois.stream()
                .map(roi -> {
                    List<CellAnnotation> cellAnnotations = cellAnnotationRepository.findAllByRoiId(roi.getId());

                    List<CellDetail> cellDetails = cellAnnotations.stream()
                            .map(ca -> new CellDetail(ca.getX(), ca.getY()))
                            .toList();

                    RoiResponseDto detail = new RoiResponseDto(
                            roi.getId(), roi.getX(), roi.getY(), roi.getWidth(), roi.getHeight(), roi.getFaulty());

                    List<String> presignedTissuePaths = roi.getTissueAnnotations().stream()
                            .map(TissueAnnotation::getAnnotationImageUrl)
                            .map(s3Service::getPresignedUrl)
                            .toList();

                    return new RoiResponsePayload(roi.getDisplayOrder(), detail, presignedTissuePaths, cellDetails);
                })
                .toList();

        List<Label> labels = labelRepository.findByAnnotationHistoryId(historyId);

        List<LabelDto> labelDtos = labels.stream()
                .map(Label::toLabelDto)
                .toList();

        return new AnnotationHistoryResponseDto(
                history.getId(),
                history.getModelName(),
                roiPayloads,
                labelDtos
        );
    }
}
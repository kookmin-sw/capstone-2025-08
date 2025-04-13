package site.pathos.domain.modelServer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;
import site.pathos.domain.annotation.tissueAnnotation.entity.AnnotationType;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.tissueAnnotation.repository.TissueAnnotationRepository;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.modelServer.entity.ModelRequestType;
import site.pathos.domain.roi.dto.request.RoiDetail;
import site.pathos.domain.modelServer.dto.request.RoiPayload;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.modelServer.dto.request.TrainingRequestDto;
import site.pathos.global.aws.sqs.service.SqsService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelServerService {
    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final TissueAnnotationRepository tissueAnnotationRepository;

    private final SqsService sqsService;

    @Transactional
    public void requestTraining(Long annotationHistoryId) {
        AnnotationHistory history = annotationHistoryRepository
                .findWithSubProjectAndModelById(annotationHistoryId)
                .orElseThrow(() -> new RuntimeException("not found"));

        TrainingRequestDto message = buildTrainingRequest(history);

        sqsService.sendTrainingRequest(message);
    }

    private  TrainingRequestDto buildTrainingRequest(AnnotationHistory history) {
        List<TissueAnnotation> mergedAnnotations = tissueAnnotationRepository.findMergedByAnnotationHistoryId(history.getId(), AnnotationType.MERGED);

        List<RoiPayload> roiMessages = mergedAnnotations.stream().map(ta -> {
            Roi roi = ta.getRoi();
            RoiDetail detail = new RoiDetail(roi.getX(), roi.getY(), roi.getWidth(), roi.getHeight());

            //TODO cell 관련 로직 추가 필요
            List<CellDetail> cellAnnotations = List.of();

            return new RoiPayload(detail, ta.getAnnotationImagePath(), cellAnnotations);
        }).toList();


        return new TrainingRequestDto(
                history.getSubProject().getId(),
                history.getId(),
                ModelRequestType.TRAINING_INFERENCE.name(),
                history.getModelName(),
                history.getModel().getModelPath(),
                history.getSubProject().getSvsImageUrl(),
                roiMessages
        );
    }
}

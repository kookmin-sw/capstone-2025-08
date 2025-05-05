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
import site.pathos.domain.inferenceHistory.service.InferenceHistoryService;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.service.ModelService;
import site.pathos.domain.modelServer.dto.request.TrainingResultRequestDto;
import site.pathos.domain.modelServer.entity.ModelRequestType;
import site.pathos.domain.roi.dto.request.RoiRequestPayload;
import site.pathos.domain.roi.dto.request.RoiRequestDto;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.modelServer.dto.request.TrainingRequestDto;
import site.pathos.domain.roi.service.RoiService;
import site.pathos.global.aws.sqs.service.SqsService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModelServerService {
    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final TissueAnnotationRepository tissueAnnotationRepository;

    private final ModelService modelService;
    private final SqsService sqsService;
    private final InferenceHistoryService inferenceHistoryService;
    private final RoiService roiService;
    private final ModelRepository modelRepository;

    @Transactional
    public void requestTraining(Long annotationHistoryId) {
        AnnotationHistory history = annotationHistoryRepository
                .findWithSubProjectAndModelById(annotationHistoryId)
                .orElseThrow(() -> new RuntimeException("not found"));

        TrainingRequestDto message = buildTrainingRequest(history);

        sqsService.sendTrainingRequest(message);
        inferenceHistoryService.saveInferenceHistory(history);
    }

    private TrainingRequestDto buildTrainingRequest(AnnotationHistory history) {
        List<TissueAnnotation> mergedAnnotations = tissueAnnotationRepository.findMergedByAnnotationHistoryId(
                history.getId(), AnnotationType.MERGED
        );

        List<RoiRequestPayload> roiMessages = mergedAnnotations.stream().map(ta -> {
            Roi roi = ta.getRoi();
            RoiRequestDto detail = new RoiRequestDto(roi.getX(), roi.getY(), roi.getWidth(), roi.getHeight());

            // TODO: cell 관련 로직 추가 필요
            List<CellDetail> cellAnnotations = List.of();

            List<String> imagePaths = List.of(ta.getAnnotationImagePath());

            return new RoiRequestPayload(detail, imagePaths, cellAnnotations);
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

    @Transactional
    public void resultTraining(TrainingResultRequestDto resultRequestDto){
        AnnotationHistory history = annotationHistoryRepository
                .findWithSubProjectAndModelById(resultRequestDto.annotation_history_id())
                .orElseThrow(() -> new RuntimeException("history not found"));

        AnnotationHistory newHistory = AnnotationHistory.builder()
                .subProject(history.getSubProject())
                .model(history.getModel())
                .modelName(history.getModelName())
                .build();

        annotationHistoryRepository.save(newHistory);

        Model baseModel = modelRepository.findByAnnotationHistoryId(history.getId())
                .orElseThrow(() -> new RuntimeException("base model not found"));

        //기존 history 기반으로 model 정보 생성, 어느 history 를 통해 생성된 모델인지
        modelService.saveModel(history, history.getModelName(), baseModel.getModelType() ,resultRequestDto.model_path());

        //TODO 모델서버에서 기능 추가시 수정 필요
        inferenceHistoryService.updateInferenceHistory(resultRequestDto.annotation_history_id(),
                0,
                0,
                0
                );

        //새로운 annotation_history 에 roi 새로 저장
        roiService.saveResultRois(newHistory, resultRequestDto.roi());
    }
}

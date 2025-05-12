package site.pathos.domain.modelServer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.cellAnnotation.entity.CellAnnotation;
import site.pathos.domain.annotation.cellAnnotation.repository.CellAnnotationRepository;
import site.pathos.domain.annotation.tissueAnnotation.entity.AnnotationType;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.tissueAnnotation.repository.TissueAnnotationRepository;
import site.pathos.domain.annotation.tissueAnnotation.service.TissueAnnotationService;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.inferenceHistory.service.InferenceHistoryService;
import site.pathos.domain.label.entity.ModelProjectLabel;
import site.pathos.domain.label.repository.ModelProjectLabelRepository;
import site.pathos.domain.label.repository.ProjectLabelRepository;
import site.pathos.domain.model.Repository.ModelRepository;
import site.pathos.domain.model.Repository.ProjectModelRepository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.model.service.ModelService;
import site.pathos.domain.modelServer.dto.request.TrainingRequestDto;
import site.pathos.domain.modelServer.dto.request.TrainingResultRequestDto;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.modelServer.dto.request.TrainingRequestMessageDto;
import site.pathos.domain.roi.repository.RoiRepository;
import site.pathos.domain.roi.service.RoiService;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.global.aws.sqs.service.SqsService;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.util.color.ColorUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModelServerService {
    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final TissueAnnotationRepository tissueAnnotationRepository;
    private final CellAnnotationRepository cellAnnotationRepository;

    private final ModelService modelService;
    private final SqsService sqsService;
    private final InferenceHistoryService inferenceHistoryService;
    private final RoiService roiService;
    private final ModelRepository modelRepository;
    private final TissueAnnotationService tissueAnnotationService;
    private final ProjectRepository projectRepository;
    private final SubProjectRepository subProjectRepository;
    private final ProjectLabelRepository projectLabelRepository;
    private final ProjectModelRepository projectModelRepository;
    private final ModelProjectLabelRepository modelProjectLabelRepository;
    private final RoiRepository roiRepository;

    @Transactional
    public void requestTraining(Long projectId, TrainingRequestDto trainingRequestDto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        TrainingRequestMessageDto message = buildTrainingRequest(project, trainingRequestDto.modelName());

        sqsService.sendTrainingRequest(message);
//        inferenceHistoryService.saveInferenceHistory();
    }

    private TrainingRequestMessageDto buildTrainingRequest(Project project, String modelName) {
        ProjectModel projectModel = projectModelRepository.findLatestByProjectIdWithModel(project.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MODEL_NOT_FOUND));

        //프로젝트에서 사용된 라벨의 정보 불러오기
        List<TrainingRequestMessageDto.LabelInfo> labelInfos = getLabelInfos(projectModel.getModel().getId(), project.getId());
        //프로젝트의 속한 서브프로젝트들의 하위 정보
        List<TrainingRequestMessageDto.SubProjectInfo> subProjectInfos = getSubProjectInfos(project);

        return new TrainingRequestMessageDto(
                project.getId(),
                "TRAINING_INFERENCE",
                modelName,
                projectModel.getModel().getModelPath(),
                labelInfos,
                subProjectInfos
        );
    }

    private List<TrainingRequestMessageDto.LabelInfo> getLabelInfos(Long modelId, Long projectId) {
        List<ModelProjectLabel> modelProjectLabels = modelProjectLabelRepository
                .findByModelIdAndProjectId(modelId, projectId);

        return modelProjectLabels.stream()
                .map(ml -> new TrainingRequestMessageDto.LabelInfo(
                        ml.getClassIndex(),
                        ml.getProjectLabel().getName(),
                        ColorUtils.hexToRgb(ml.getProjectLabel().getColor())
                ))
                .toList();
    }

    private List<TrainingRequestMessageDto.SubProjectInfo> getSubProjectInfos(Project project) {
        List<SubProject> subProjects = subProjectRepository.findAllByProjectId(project.getId());

        return subProjects.stream()
                .map(subProject -> {
                    AnnotationHistory latestHistory = annotationHistoryRepository
                            .findLatestBySubProjectId(subProject.getId())
                            .orElseThrow(() -> new BusinessException(ErrorCode.ANNOTATION_HISTORY_NOT_FOUND));

                    List<Roi> rois = roiRepository.findAllByAnnotationHistoryId(latestHistory.getId());
                    List<Long> roiIds = rois.stream().map(Roi::getId).toList();

                    List<CellAnnotation> cellAnnotations = cellAnnotationRepository.findAllByRoiIdIn(roiIds);
                    List<TissueAnnotation> tissueAnnotations =
                            tissueAnnotationRepository.findByRoiIdInAndAnnotationType(roiIds, AnnotationType.MERGED);

                    Map<Long, List<CellAnnotation>> roiToCells = cellAnnotations.stream()
                            .collect(Collectors.groupingBy(c -> c.getRoi().getId()));

                    Map<Long, List<TissueAnnotation>> roiToTissues = tissueAnnotations.stream()
                            .collect(Collectors.groupingBy(t -> t.getRoi().getId()));

                    List<TrainingRequestMessageDto.Roi> roiDtos = rois.stream()
                            .map(r -> mapToRoiDto(r, roiToCells, roiToTissues))
                            .toList();

                    return new TrainingRequestMessageDto.SubProjectInfo(
                            subProject.getId(),
                            latestHistory.getId(),
                            subProject.getSvsImageUrl(),
                            roiDtos
                    );
                })
                .toList();
    }

    private TrainingRequestMessageDto.Roi mapToRoiDto(
            Roi r,
            Map<Long, List<CellAnnotation>> roiToCells,
            Map<Long, List<TissueAnnotation>> roiToTissues
    ) {
        List<TrainingRequestMessageDto.Cell> cells = roiToCells.getOrDefault(r.getId(), List.of())
                .stream()
                .map(c -> new TrainingRequestMessageDto.Cell(
                        c.getX(),
                        c.getY(),
                        c.getClassIndex()
                ))
                .toList();

        String tissuePath = roiToTissues.getOrDefault(r.getId(), List.of())
                .stream()
                .filter(t -> t.getAnnotationType() == AnnotationType.MERGED)
                .map(TissueAnnotation::getAnnotationImageUrl)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.MERGED_TISSUE_NOT_FOUND));

        return new TrainingRequestMessageDto.Roi(
                r.getDisplayOrder(),
                new TrainingRequestMessageDto.RoiDetail(
                        r.getX(), r.getY(), r.getWidth(), r.getHeight()
                ),
                tissuePath,
                cells
        );
    }

//    @Transactional
//    public void resultTraining(Long annotationHistoryId,TrainingResultRequestDto resultRequestDto){
//        AnnotationHistory history = annotationHistoryRepository
//                .findWithSubProjectAndModelById(annotationHistoryId)
//                .orElseThrow(() -> new RuntimeException("history not found"));
//
//        AnnotationHistory newHistory = AnnotationHistory.builder()
//                .subProject(history.getSubProject())
//                .model(history.getModel())
//                .modelName(history.getModelName())
//                .build();
//
//        annotationHistoryRepository.save(newHistory);
//
//        Model baseModel = modelRepository.findByAnnotationHistoryId(history.getId())
//                .orElseThrow(() -> new RuntimeException("base model not found"));
//
//        //기존 history 기반으로 model 정보 생성, 어느 history 를 통해 생성된 모델인지
//        modelService.saveModel(history, history.getModelName(), baseModel.getModelType() ,resultRequestDto.model_path());
//
//        //TODO 모델서버에서 기능 추가시 수정 필요
//        inferenceHistoryService.updateInferenceHistory(annotationHistoryId,
//                0,
//                0,
//                0
//                );
//
//        //새로운 annotation_history 에 roi 새로 저장
//        roiService.saveResultRois(newHistory, resultRequestDto.roi());
//    }

}

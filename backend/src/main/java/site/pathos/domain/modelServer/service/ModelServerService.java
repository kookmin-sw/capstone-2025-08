package site.pathos.domain.modelServer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.cellAnnotation.entity.CellAnnotation;
import site.pathos.domain.annotation.cellAnnotation.repository.CellAnnotationRepository;
import site.pathos.domain.annotation.tissueAnnotation.entity.AnnotationType;
import site.pathos.domain.annotation.tissueAnnotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.tissueAnnotation.repository.TissueAnnotationRepository;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.inferenceHistory.entity.InferenceHistory;
import site.pathos.domain.inferenceHistory.entity.TrainingHistory;
import site.pathos.domain.inferenceHistory.repository.InferenceHistoryRepository;
import site.pathos.domain.inferenceHistory.repository.TrainingHistoryRepository;
import site.pathos.domain.inferenceHistory.service.InferenceHistoryService;
import site.pathos.domain.inferenceHistory.service.TrainingHistoryService;
import site.pathos.domain.label.entity.ModelLabel;
import site.pathos.domain.label.repository.ModelProjectLabelRepository;
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
    private final TrainingHistoryRepository trainingHistoryRepository;
    private final InferenceHistoryRepository inferenceHistoryRepository;

    private final ModelService modelService;
    private final SqsService sqsService;
    private final InferenceHistoryService inferenceHistoryService;
    private final ProjectRepository projectRepository;
    private final SubProjectRepository subProjectRepository;
    private final ProjectModelRepository projectModelRepository;
    private final ModelProjectLabelRepository modelProjectLabelRepository;
    private final RoiRepository roiRepository;
    private final TrainingHistoryService trainingHistoryService;

    @Transactional
    public void requestTraining(Long projectId, TrainingRequestDto trainingRequestDto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        ProjectModel projectModel = projectModelRepository.findLatestByProjectIdWithModel(project.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MODEL_NOT_FOUND));

        TrainingHistory trainingHistory = trainingHistoryService.createTrainingHistory(project, projectModel.getModel());
        InferenceHistory inferenceHistory = inferenceHistoryService.createInferenceHistory(project, projectModel.getModel());

        TrainingRequestMessageDto message = buildTrainingRequest(project, trainingRequestDto.modelName(), projectModel,
                trainingHistory, inferenceHistory);

        sqsService.sendTrainingRequest(message);
    }

    private TrainingRequestMessageDto buildTrainingRequest(Project project, String modelName, ProjectModel projectModel,
                                                           TrainingHistory trainingHistory, InferenceHistory inferenceHistory) {

        //프로젝트에서 사용된 라벨의 정보 불러오기
        List<TrainingRequestMessageDto.LabelInfo> labelInfos = getLabelInfos(projectModel.getModel().getId(), project.getId());
        //프로젝트의 속한 서브프로젝트들의 하위 정보
        List<TrainingRequestMessageDto.SubProjectInfo> subProjectInfos = getSubProjectInfos(project);

        return new TrainingRequestMessageDto(
                trainingHistory.getId(),
                inferenceHistory.getId(),
                project.getId(),
                "TRAINING_INFERENCE",
                project.getModelType(),
                modelName,
                projectModel.getModel().getTissueModelPath(),
                projectModel.getModel().getCellModelPath(),
                labelInfos,
                subProjectInfos
        );
    }

    private List<TrainingRequestMessageDto.LabelInfo> getLabelInfos(Long modelId, Long projectId) {
        List<ModelLabel> modelLabels = modelProjectLabelRepository
                .findByModelIdAndProjectId(modelId, projectId);

        return modelLabels.stream()
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
                            .findFirstBySubProjectIdOrderByUpdatedAtDesc(subProject.getId())
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
                            subProject.getSvsImagePath(),
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
                        c.getClassIndex(),
                        new TrainingRequestMessageDto.PolygonDto(
                                c.getPolygon().stream()
                                        .map(p -> new TrainingRequestMessageDto.PointDto(p.getX(), p.getY()))
                                        .toList()
                        )
                ))
                .toList();

        String tissuePath = roiToTissues.getOrDefault(r.getId(), List.of())
                .stream()
                .filter(t -> t.getAnnotationType() == AnnotationType.MERGED)
                .map(TissueAnnotation::getAnnotationImagePath)
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.MERGED_TISSUE_NOT_FOUND));

        return new TrainingRequestMessageDto.Roi(
                r.getId(),
                r.getDisplayOrder(),
                new TrainingRequestMessageDto.RoiDetail(
                        r.getX(), r.getY(), r.getWidth(), r.getHeight()
                ),
                tissuePath,
                cells
        );
    }

    @Transactional
    public void resultTraining(Long projectId ,TrainingResultRequestDto resultRequestDto){
        TrainingHistory trainingHistory = trainingHistoryRepository.findById(resultRequestDto.trainingHistoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TRAINING_HISTORY_NOT_FOUND));

        InferenceHistory inferenceHistory = inferenceHistoryRepository.findById(resultRequestDto.inferenceHistoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INFERENCE_HISTORY_NOT_FOUND));

        TrainingResultRequestDto.Performance performance = resultRequestDto.performance();
        inferenceHistory.updateResult(performance.accuracy(), performance.loss(), performance.loopPerformance());

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));


        Model newModel = modelService.saveModel(
                trainingHistory,
                resultRequestDto.modelName(),
                project.getModelType(),
                resultRequestDto.tissueModelPath(),
                resultRequestDto.cellModelPath()
        );

        ProjectModel projectModel = ProjectModel.builder()
                .name(resultRequestDto.modelName())
                .project(project)
                .model(newModel)
                .isInitial(false)
                .build();
        projectModelRepository.save(projectModel);

        for (TrainingResultRequestDto.SubProjectInfo sub : resultRequestDto.subProjects()) {
            SubProject subProject = subProjectRepository.findById(sub.subProjectId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.SUB_PROJECT_NOT_FOUND));

            AnnotationHistory newHistory = AnnotationHistory.builder()
                    .subProject(subProject)
                    .model(newModel)
                    .trainingHistory(trainingHistory)
                    .build();
            annotationHistoryRepository.save(newHistory);

            for (TrainingResultRequestDto.Roi roiDto : sub.roi()){
                Roi roi = Roi.builder()
                        .annotationHistory(newHistory)
                        .x(roiDto.detail().x())
                        .y(roiDto.detail().y())
                        .width(roiDto.detail().width())
                        .height(roiDto.detail().height())
                        .displayOrder(roiDto.displayOrder())
                        .faulty(roiDto.faulty())
                        .build();
                roiRepository.save(roi);

                List<CellAnnotation> cellAnnotations = roiDto.cells().stream()
                        .map(cell -> CellAnnotation.builder()
                                .roi(roi)
                                .classIndex(cell.classIndex())
                                .polygon(cell.polygon().points().stream()
                                        .map(p -> new CellAnnotation.Point(p.x(), p.y()))
                                        .toList())
                                .build())
                        .toList();
                cellAnnotationRepository.saveAll(cellAnnotations);

                TissueAnnotation tissueAnnotation = TissueAnnotation.builder()
                        .roi(roi)
                        .annotationType(AnnotationType.RESULT)
                        .annotationImagePath(roiDto.tissue_path())
                        .build();
                tissueAnnotationRepository.save(tissueAnnotation);
            }
        }
    }
}

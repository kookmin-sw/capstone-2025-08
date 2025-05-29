package site.pathos.domain.model.service;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotation.entity.AnnotationHistory;
import site.pathos.domain.annotation.entity.CellAnnotation;
import site.pathos.domain.annotation.entity.Roi;
import site.pathos.domain.annotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.enums.AnnotationType;
import site.pathos.domain.annotation.repository.AnnotationHistoryRepository;
import site.pathos.domain.annotation.repository.CellAnnotationRepository;
import site.pathos.domain.annotation.repository.ModelProjectLabelRepository;
import site.pathos.domain.annotation.repository.ProjectLabelRepository;
import site.pathos.domain.annotation.repository.RoiRepository;
import site.pathos.domain.annotation.repository.TissueAnnotationRepository;
import site.pathos.domain.annotation.service.TissueAnnotationService;
import site.pathos.domain.model.dto.TrainingRequestDto;
import site.pathos.domain.model.dto.TrainingRequestMessageDto;
import site.pathos.domain.model.dto.TrainingResultRequestDto;
import site.pathos.domain.model.entity.*;
import site.pathos.domain.model.enums.MetricType;
import site.pathos.domain.model.enums.ModelRequestType;
import site.pathos.domain.model.enums.ModelType;
import site.pathos.domain.model.event.ProjectRunCompletedEvent;
import site.pathos.domain.model.event.ProjectTrainCompletedEvent;
import site.pathos.domain.model.repository.*;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.entity.ProjectLabel;
import site.pathos.domain.project.entity.SubProject;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.project.repository.SubProjectRepository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.aws.sqs.service.SqsService;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.util.color.ColorUtils;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModelServerService {
    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final TissueAnnotationRepository tissueAnnotationRepository;
    private final CellAnnotationRepository cellAnnotationRepository;
    private final TrainingHistoryRepository trainingHistoryRepository;
    private final InferenceHistoryRepository inferenceHistoryRepository;
    private final ProjectMetricRepository projectMetricRepository;

    private final ModelService modelService;
    private final SqsService sqsService;
    private final InferenceHistoryService inferenceHistoryService;
    private final ProjectRepository projectRepository;
    private final SubProjectRepository subProjectRepository;
    private final ProjectModelRepository projectModelRepository;
    private final ModelProjectLabelRepository modelProjectLabelRepository;
    private final RoiRepository roiRepository;
    private final TrainingHistoryService trainingHistoryService;
    private final TissueAnnotationService tissueAnnotationService;
    private final S3Service s3Service;

    private final ApplicationEventPublisher eventPublisher;
    private final ProjectLabelRepository projectLabelRepository;
    private final ModelRepository modelRepository;
    private final UserRepository userRepository;
    private final UserModelRepository userModelRepository;

    @Transactional
    public void requestTraining(Long projectId, TrainingRequestDto trainingRequestDto) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        List<ProjectModel> projectModels = projectModelRepository.findByProjectIdWithModelOrderByCreatedAtDesc(project.getId());

        if (projectModels.isEmpty()) {
            throw new BusinessException(ErrorCode.PROJECT_MODEL_NOT_FOUND);
        }

        ProjectModel projectModel = projectModels.get(0);

        Model newModel = createEmptyModel(project, trainingRequestDto.modelName(), project.getModelType());

        TrainingHistory trainingHistory = trainingHistoryService.createTrainingHistory(project, projectModel.getModel());
        InferenceHistory inferenceHistory = inferenceHistoryService.createInferenceHistory(project, projectModel.getModel());

        TrainingRequestMessageDto message = buildTrainingRequest(project, trainingRequestDto.modelName(), projectModel,
                newModel, trainingHistory, inferenceHistory);

        sqsService.sendTrainingRequest(message);
    }

    private TrainingRequestMessageDto buildTrainingRequest(Project project, String modelName, ProjectModel projectModel, Model newModel,
                                                           TrainingHistory trainingHistory, InferenceHistory inferenceHistory) {

        //프로젝트에서 사용된 라벨의 정보 불러오기
        List<TrainingRequestMessageDto.LabelInfo> labelInfos = getLabelInfos(projectModel.getModel().getId(), project.getId(), newModel);
        //프로젝트의 속한 서브프로젝트들의 하위 정보
        List<TrainingRequestMessageDto.SubProjectInfo> subProjectInfos = getSubProjectInfos(project);

        return new TrainingRequestMessageDto(
                trainingHistory.getId(),
                inferenceHistory.getId(),
                project.getId(),
                "TRAINING_INFERENCE",
                project.getModelType(),
                modelName,
                newModel.getId(),
                projectModel.getModel().getTissueModelPath(),
                projectModel.getModel().getCellModelPath(),
                labelInfos,
                subProjectInfos
        );
    }

    private Model createEmptyModel(Project project, String modelName, ModelType modelType) {
        Model model = Model.builder()
                .name(modelName)
                .modelType(modelType)
                .tissueModelPath(null)
                .cellModelPath(null)
                .build();
        return modelRepository.save(model);
    }

    private List<TrainingRequestMessageDto.LabelInfo> getLabelInfos(Long modelId, Long projectId, Model newModel) {
        List<ModelLabel> modelLabels = modelProjectLabelRepository.findByModelIdAndProjectId(modelId, projectId);

        if (modelLabels.isEmpty()) {
            List<ProjectLabel> projectLabels = projectLabelRepository.findAllByProjectId(projectId);

            // ModelLabel 생성 및 저장
            List<ModelLabel> newModelLabels = projectLabels.stream()
                    .map(pl -> ModelLabel.builder()
                            .model(newModel)
                            .projectLabel(pl)
                            .classIndex(pl.getDisplayOrder())
                            .build())
                    .toList();

            modelProjectLabelRepository.saveAll(newModelLabels);

            // DTO 반환
            return newModelLabels.stream()
                    .map(ml -> new TrainingRequestMessageDto.LabelInfo(
                            ml.getClassIndex(),
                            ml.getProjectLabel().getName(),
                            ColorUtils.hexToRgb(ml.getProjectLabel().getColor())
                    ))
                    .toList();
        }

        // 커스텀 모델인 경우
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
        trainingHistory.trainEnd();

        InferenceHistory inferenceHistory = inferenceHistoryRepository.findById(resultRequestDto.inferenceHistoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INFERENCE_HISTORY_NOT_FOUND));

        Project project = projectRepository.findByIdWithUser(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));


        Model newModel = modelRepository.findById(resultRequestDto.newModelId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MODEL_NOT_FOUND));

        newModel.saveResult(trainingHistory, resultRequestDto.tissueModelPath(), resultRequestDto.cellModelPath());

        UserModel userModel = UserModel.builder()
                .user(project.getUser())
                .model(newModel)
                .build();
        userModelRepository.save(userModel);

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

                tissueAnnotationService.saveResultAnnotation(roi, roiDto.tissuePath());
            }
        }
        createMetric(project, inferenceHistory);
        publishCompletedEvent(resultRequestDto.type(), project);
    }

    private void publishCompletedEvent(ModelRequestType modelRequestType, Project project) {
        if (modelRequestType == ModelRequestType.TRAINING_INFERENCE) {
            eventPublisher.publishEvent(
                    new ProjectTrainCompletedEvent(
                            project.getUser(),
                            project.getId(),
                            project.getTitle()
                    )
            );
        } else if (modelRequestType == ModelRequestType.INFERENCE) {
            eventPublisher.publishEvent(
                    new ProjectRunCompletedEvent(
                            project.getUser(),
                            project.getId(),
                            project.getTitle()
                    )
            );
        }
    }

    public void createMetric(Project project, InferenceHistory inferenceHistory) {
        try {
            String key = "log.txt";
            Map<Long, List<Double>> roiEntropyMap = new HashMap<>();

            InputStream inputStream = s3Service.downloadFile(key);
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            try (inputStream; reader) {
                String line;
                while ((line = reader.readLine()) != null) {
                    final String currentLine = line;

                    Optional<MetricType> optionalType = MetricType.parseLine(currentLine);
                    if (optionalType.isPresent()) {
                        MetricType type = optionalType.get();
                        double value = type.parseValue(currentLine);
                        ProjectMetric projectMetric = ProjectMetric.builder()
                                .project(project)
                                .metricType(type)
                                .score(value)
                                .build();
                        projectMetricRepository.save(projectMetric);
                        continue;
                    }

                    if (currentLine.startsWith("Image Name:")) {
                        try {
                            String[] parts = currentLine.split(", Mean Entropy per-images:");
                            String imagePart = parts[0].trim();
                            String[] imageNameParts = imagePart.split("_");
                            long roiId = Long.parseLong(imageNameParts[1]);
                            double entropyValue = Double.parseDouble(parts[1].trim());
                            roiEntropyMap.computeIfAbsent(roiId, k -> new ArrayList<>()).add(entropyValue);
                        } catch (Exception e) {
                            log.warn("엔트로피 파싱 중 오류 발생: {}", currentLine, e);
                        }
                    }
                }
            }
            updateProjectMetric(project, inferenceHistory);
            updateRoiMetric(roiEntropyMap);

        } catch (FileNotFoundException | S3Exception e) {
            log.warn("S3에 log.txt 파일이 존재하지 않아 Metric 생성을 건너뜁니다.");
        } catch (IOException e) {
            log.error("프로젝트 Metric 업데이트에 실패했습니다. I/O 에러", e);
        }
    }

    private void updateRoiMetric(Map<Long, List<Double>> roiEntropyMap) {
        for (long roiId : roiEntropyMap.keySet()) {
            Roi roi = roiRepository.findById(roiId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.INTERNAL_ERROR));
            List<Double> scores = roiEntropyMap.get(roiId);
            int score = (int) Math.round(
                    scores.stream()
                            .mapToDouble(it -> it)
                            .average()
                            .orElse(0.0) * 100);
            roi.changeFaulty(score);
        }
    }

    private void updateProjectMetric(Project project, InferenceHistory inferenceHistory) {
        List<ProjectMetric> projectMetrics = projectMetricRepository.findAllByProject(project);

        double accuracyAverage = calculateAverage(projectMetrics, MetricType.ACCURACY);
        double lossAverage = calculateAverage(projectMetrics, MetricType.LOSS);
        double iouAverage = calculateAverage(projectMetrics, MetricType.IOU);

        inferenceHistory.updateResult(accuracyAverage, lossAverage, iouAverage);
    }

    private double calculateAverage(List<ProjectMetric> projectMetrics, MetricType type) {
        return projectMetrics.stream()
                .filter(projectMetric -> projectMetric.getMetricType() == type)
                .mapToDouble(ProjectMetric::getScore)
                .average()
                .orElse(0.0);
    }
}

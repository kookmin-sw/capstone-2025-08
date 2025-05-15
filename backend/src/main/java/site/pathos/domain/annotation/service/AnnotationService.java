package site.pathos.domain.annotation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.dto.response.CellDetail;
import site.pathos.domain.annotation.dto.response.PolygonDto;
import site.pathos.domain.annotation.entity.CellAnnotation;
import site.pathos.domain.annotation.repository.CellAnnotationRepository;
import site.pathos.domain.annotation.entity.TissueAnnotation;
import site.pathos.domain.annotation.dto.response.AnnotationHistoryResponseDto;
import site.pathos.domain.annotation.dto.response.AnnotationHistorySummaryDto;
import site.pathos.domain.annotation.entity.AnnotationHistory;
import site.pathos.domain.annotation.repository.AnnotationHistoryRepository;
import site.pathos.domain.annotation.entity.Label;
import site.pathos.domain.annotation.entity.ProjectLabel;
import site.pathos.domain.annotation.repository.LabelRepository;
import site.pathos.domain.annotation.repository.ProjectLabelRepository;
import site.pathos.domain.model.Repository.ProjectModelRepository;
import site.pathos.domain.model.entity.ProjectModel;
import site.pathos.domain.annotation.dto.response.GetProjectAnnotationResponseDto;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.annotation.dto.request.RoiLabelSaveRequestDto;
import site.pathos.domain.annotation.dto.response.RoiResponseDto;
import site.pathos.domain.annotation.dto.response.RoiResponsePayload;
import site.pathos.domain.annotation.entity.Roi;
import site.pathos.domain.annotation.repository.RoiRepository;
import site.pathos.domain.project.dto.response.SubProjectResponseDto;
import site.pathos.domain.project.dto.response.SubProjectSummaryDto;
import site.pathos.domain.project.entity.SubProject;
import site.pathos.domain.project.repository.SubProjectRepository;
import site.pathos.global.aws.s3.S3Service;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AnnotationService {

    private final AnnotationHistoryRepository annotationHistoryRepository;
    private final RoiRepository roiRepository;
    private final TissueAnnotationService tissueAnnotationService;
    private final ProjectRepository projectRepository;
    private final ProjectLabelRepository projectLabelRepository;
    private final LabelRepository labelRepository;
    private final SubProjectRepository subProjectRepository;
    private final ProjectModelRepository projectModelRepository;
    private final CellAnnotationRepository cellAnnotationRepository;
    private final S3Service s3Service;

    @Transactional
    public void saveWithAnnotations(Long subProjectId, Long annotationHistoryId,
                                    List<RoiLabelSaveRequestDto.RoiSaveRequestDto> rois, List<MultipartFile> images, List<RoiLabelSaveRequestDto.LabelDto> labels) {
        AnnotationHistory history = annotationHistoryRepository.findById(annotationHistoryId)
                .orElseThrow(() -> new IllegalArgumentException("AnnotationHistory not found"));

        history.setUpdatedAt();

        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUB_PROJECT_NOT_FOUND));

        subProject.setUpdatedAt();

        Project project = projectRepository.findBySubProjectId(subProjectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        project.setUpdatedAt();

        for (RoiLabelSaveRequestDto.LabelDto labelDto : labels){
            if(labelDto.id() == null){
                createLabel(project, labelDto);
            } else {
                updateLabel(project, labelDto);
            }
        }

        for(RoiLabelSaveRequestDto.RoiSaveRequestDto roiDto : rois){
            List<MultipartFile> matchedImages = images.stream()
                    .filter(img -> roiDto.imageNames().contains(img.getOriginalFilename()))
                    .toList();
            if (roiDto.roiId() != null) {
                Roi roi = updateRoi(roiDto);
                tissueAnnotationService.deleteTissueAnnotationsByRoiId(roi.getId());
                tissueAnnotationService.uploadTissueAnnotations(subProjectId, annotationHistoryId,
                        roi.getId(), matchedImages);
            } else {
                Roi roi = createRoi(history, roiDto);
                tissueAnnotationService.uploadTissueAnnotations(subProjectId, annotationHistoryId,
                        roi.getId(), matchedImages);
            }
        }
    }

    private Roi updateRoi(RoiLabelSaveRequestDto.RoiSaveRequestDto roiDto) {
        Roi roi = roiRepository.findById(roiDto.roiId())
                .orElseThrow(() -> new RuntimeException("ROI not found: " + roiDto.roiId()));
        roi.changeCoordinates(
                roiDto.x(),
                roiDto.y(),
                roiDto.width(),
                roiDto.height()
        );
        return roi;
    }

    private Roi createRoi(AnnotationHistory history, RoiLabelSaveRequestDto.RoiSaveRequestDto roiDto) {
        Integer max = roiRepository.findMaxDisplayOrderByAnnotationHistory(history.getId());
        int displayOrder = (max == null) ? 0 : max + 1;

        Roi roi = Roi.builder()
                .annotationHistory(history)
                .x(roiDto.x())
                .y(roiDto.y())
                .width(roiDto.width())
                .height(roiDto.height())
                .displayOrder(displayOrder)
                .build();
        return roiRepository.save(roi);
    }

    private ProjectLabel createLabel(Project project, RoiLabelSaveRequestDto.LabelDto labelDto){
        Label label = Label.create();
        labelRepository.save(label);

        ProjectLabel projectLabel = ProjectLabel.builder()
                .project(project)
                .label(label)
                .name(labelDto.name())
                .color(labelDto.color())
                .build();
        return projectLabelRepository.save(projectLabel);
    }

    private ProjectLabel updateLabel(Project project, RoiLabelSaveRequestDto.LabelDto labelDto){
        ProjectLabel projectLabel = projectLabelRepository.findByProjectIdAndLabelId(project.getId(), labelDto.id())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_LABEL_NOT_FUND));

        projectLabel.changeLabel(labelDto.color(), labelDto.name());

        return projectLabel;
    }

    @Transactional(readOnly = true)
    public GetProjectAnnotationResponseDto getProjectAnnotation(Long projectId){
        Long userId = 1L;   // TODO
        Project project = getProject(projectId, userId);
        List<SubProject> subProjects = subProjectRepository.findAllByProjectId(projectId);

        List<SubProjectSummaryDto> subProjectsDto = subProjects.stream()
                .map(sp -> new SubProjectSummaryDto(
                        sp.getId(),
                        s3Service.getPresignedUrl(sp.getThumbnailPath()),
                        sp.isUploadComplete()
                ))
                .toList();


        boolean hasIncompleteUploads = subProjectRepository.existsByProjectIdAndIsUploadCompleteFalse(projectId);
        if (hasIncompleteUploads) {
            throw new BusinessException(ErrorCode.SUB_PROJECT_NOT_READY);
        }

        GetProjectAnnotationResponseDto.ModelsDto modelsDto = getProjectModels(project);

        List<GetProjectAnnotationResponseDto.LabelDto> labelDtos = getProjectLabels(project);

        SubProject firstSubProject = getFirstSubProject(projectId);

        return new GetProjectAnnotationResponseDto(
                projectId,
                project.getTitle(),
                modelsDto,
                labelDtos,
                subProjectsDto,
                firstSubProject.getId()
        );
    }

    private Project getProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_PROJECT_ACCESS);
        }

        return project;
    }

    private GetProjectAnnotationResponseDto.ModelsDto getProjectModels(Project project){
        List<ProjectModel> projectModels = projectModelRepository.findByProjectIdOrderByCreatedAt(project.getId());

        List<GetProjectAnnotationResponseDto.ProjectModelsDto> projectModelsDto = projectModels.stream()
                .map(pm -> new GetProjectAnnotationResponseDto.ProjectModelsDto(
                        pm.getId(),
                        pm.getModel().getName()
                ))
                .toList();

        return new GetProjectAnnotationResponseDto.ModelsDto(
                project.getModelType(),
                projectModelsDto
        );
    }

    private List<GetProjectAnnotationResponseDto.LabelDto> getProjectLabels(Project project){
        List<ProjectLabel> projectLabels = projectLabelRepository.findAllByProjectId(project.getId());

        return projectLabels.stream()
                .map(projectLabel -> new GetProjectAnnotationResponseDto.LabelDto(
                        projectLabel.getId(),
                        projectLabel.getName(),
                        projectLabel.getColor()
                ))
                .toList();
    }

    public AnnotationHistoryResponseDto getAnnotationHistory(Long historyId) {
        AnnotationHistory history = annotationHistoryRepository.findWithSubProjectAndModelById(historyId)
                .orElseThrow(() -> new RuntimeException("AnnotationHistory not found"));

        List<Roi> rois = roiRepository.findAllByAnnotationHistoryId(history.getId());

        List<RoiResponsePayload> roiPayloads = rois.stream()
                .map(roi -> {
                    List<CellAnnotation> cellAnnotations = cellAnnotationRepository.findAllByRoiId(roi.getId());

                    List<CellDetail> cellDetails = cellAnnotations.stream()
                            .map(ca -> new CellDetail(
                                    ca.getClassIndex(),
                                    ca.getColor(),
                                    new PolygonDto(
                                            ca.getPolygon().stream()
                                                    .map(p -> new PolygonDto.PointDto(p.getX(), p.getY()))
                                                    .toList()
                                    )
                            ))
                            .toList();

                    RoiResponseDto detail = new RoiResponseDto(
                            roi.getId(), roi.getX(), roi.getY(), roi.getWidth(), roi.getHeight(), roi.getFaulty());

                    List<String> presignedTissuePaths = roi.getTissueAnnotations().stream()
                            .map(TissueAnnotation::getAnnotationImagePath)
                            .map(s3Service::getPresignedUrl)
                            .toList();

                    return new RoiResponsePayload(roi.getDisplayOrder(), detail, presignedTissuePaths, cellDetails);
                })
                .toList();

        return new AnnotationHistoryResponseDto(
                history.getId(),
                roiPayloads
        );
    }

    private SubProject getFirstSubProject(Long projectId){
        List<SubProject> subProjects = subProjectRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
        if (subProjects.isEmpty()) {
            throw new BusinessException(ErrorCode.SUB_PROJECT_NOT_FOUND);
        }

        return subProjects.get(0);
    }

    @Transactional(readOnly = true)
    public SubProjectResponseDto getSubProject(Long subProjectId){
        //TODO 추후에 메서드 분리 필요
        List<AnnotationHistory> histories = annotationHistoryRepository
                .findAllBySubProjectId(subProjectId)
                .stream()
                .sorted(Comparator.comparing(AnnotationHistory::getCreatedAt)) // startedAt 기준 정렬
                .toList();

        List<AnnotationHistorySummaryDto> historyDtos = IntStream.range(0, histories.size())
                .mapToObj(i -> {
                    AnnotationHistory h = histories.get(i);
                    return new AnnotationHistorySummaryDto(
                            h.getId(),
                            i+1,
                            h.getCreatedAt(),
                            h.getCompletedAt()// 1번부터 시작
                    );
                })
                .toList();

        Long latestAnnotationHistoryId = histories.isEmpty()
                ? null
                : histories.get(histories.size() - 1).getId();

        //TODO 나중에 실제 userId로 변경 필요
        Long userId =  1L;

        Project project = getProjectBySubProjectId(subProjectId, userId);

        List<ProjectModel> projectModels = projectModelRepository.findByProjectIdOrderByCreatedAt(project.getId());

        List<SubProjectResponseDto.ModelSummaryDto> modelsDto = projectModels.stream()
                .map(pm -> new SubProjectResponseDto.ModelSummaryDto(
                        pm.getModel().getId(),   // 모델 ID
                        pm.getModel().getName()  // 모델 이름
                ))
                .toList();

        return new SubProjectResponseDto(
                subProjectId,
                historyDtos,
                latestAnnotationHistoryId,
                modelsDto,
                project.getModelType()
        );
    }

    private Project getProjectBySubProjectId(Long subProjectId, Long userId) {
        SubProject subProject = subProjectRepository.findById(subProjectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUB_PROJECT_NOT_FOUND));

        Project project = projectRepository.findProjectWithUserBySubProjectId(subProjectId);

        if (!project.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_PROJECT_ACCESS);
        }

        return project;
    }
}

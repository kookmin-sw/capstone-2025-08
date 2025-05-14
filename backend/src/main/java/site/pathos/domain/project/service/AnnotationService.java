package site.pathos.domain.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.tissueAnnotation.service.TissueAnnotationService;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.annotationHistory.repository.AnnotationHistoryRepository;
import site.pathos.domain.label.entity.Label;
import site.pathos.domain.label.entity.ProjectLabel;
import site.pathos.domain.label.repository.LabelRepository;
import site.pathos.domain.label.repository.ProjectLabelRepository;
import site.pathos.domain.project.entity.Project;
import site.pathos.domain.project.repository.ProjectRepository;
import site.pathos.domain.roi.dto.request.RoiLabelSaveRequestDto;
import site.pathos.domain.roi.entity.Roi;
import site.pathos.domain.roi.repository.RoiRepository;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.subProject.repository.SubProjectRepository;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

import java.util.List;

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
}

package site.pathos.domain.modelServer.dto.request;

import java.util.List;

public record TrainingRequestMessageDto(
        Long projectId,
        String type,
        String modelName,
        String modelPath,
        List<LabelInfo> labels,
        List<SubProjectInfo> subProjects
) {
    public record LabelInfo(
            int classIndex,
            String name,
            int[] color
    ) {}

    public record SubProjectInfo(
            Long subProjectId,
            Long annotationHistoryId,
            String svsPath,
            List<Roi> roi
    ) {}

    public record Roi(
            int displayOrder,
            RoiDetail detail,
            String tissue_path,
            List<Cell> cells
    ) {}

    public record RoiDetail(
            int x,
            int y,
            int width,
            int height
    ) {}

    public record Cell(
            int x,
            int y,
            int classIndex
    ) {}
}

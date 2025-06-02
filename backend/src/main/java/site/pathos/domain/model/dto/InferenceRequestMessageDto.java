package site.pathos.domain.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.model.enums.ModelRequestType;
import site.pathos.domain.model.enums.ModelType;

import java.util.List;

@Schema(description = "Inference 요청 메시지 DTO")
public record InferenceRequestMessageDto(

        @Schema(description = "추론 기록 ID", example = "1")
        Long inferenceHistoryId,

        @Schema(description = "프로젝트 ID", example = "1")
        Long projectId,

        @Schema(description = "요청 타입", example = "INFERENCE")
        ModelRequestType modelRequestType,

        @Schema(description = "모델 종류", example = "MULTI")
        ModelType modelType,

        @Schema(description = "조직 모델 경로", example = "s3://bucket/model/tissue.pt")
        String tissueModelPath,

        @Schema(description = "세포 모델 경로", example = "s3://bucket/model/cell.pt")
        String cellModelPath,

        @Schema(description = "모델 라벨 정보 목록")
        List<LabelInfo> labels,

        @Schema(description = "SubProject 정보 목록")
        List<TrainingRequestMessageDto.SubProjectInfo> subProjects
) {
    @Schema(description = "라벨 정보")
    public record LabelInfo(
            @Schema(description = "클래스 인덱스", example = "0")
            int classIndex,

            @Schema(description = "클래스 이름", example = "Cancer Cell")
            String name,

            @Schema(description = "RGB 색상", example = "[255, 0, 0]")
            int[] color
    ) {}

    @Schema(description = "SubProject 단위 정보")
    public record SubProjectInfo(
            @Schema(description = "SubProject ID", example = "101")
            Long subProjectId,

            @Schema(description = "AnnotationHistory ID", example = "1001")
            Long annotationHistoryId,

            @Schema(description = "SVS 이미지 경로", example = "s3://bucket/subproject1/image.svs")
            String svsPath,

            @Schema(description = "ROI 리스트")
            List<Roi> roi
    ) {}

    @Schema(description = "ROI 정보")
    public record Roi(
            @Schema(description = "ROI ID", example = "1")
            Long roiId,

            @Schema(description = "표시 순서", example = "0")
            int displayOrder,

            @Schema(description = "ROI 위치 정보")
            RoiDetail detail,

            @Schema(description = "조직 이미지 경로", example = "s3://bucket/subproject1/roi1/merged.jpg")
            String tissuePath,

            @Schema(description = "셀 정보 목록")
            List<Cell> cells
    ) {}

    @Schema(description = "ROI 위치 정보")
    public record RoiDetail(
            int x,
            int y,
            int width,
            int height
    ) {}

    @Schema(description = "셀 정보")
    public record Cell(
            int classIndex,
            PolygonDto polygon
    ) {}

    @Schema(description = "Polygon 좌표 정보 DTO")
    public record PolygonDto(
            List<PointDto> points
    ) {}

    @Schema(description = "2D 평면의 좌표")
    public record PointDto(
            int x,
            int y
    ) {}
}
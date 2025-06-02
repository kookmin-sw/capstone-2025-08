package site.pathos.domain.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import site.pathos.domain.model.enums.ModelRequestType;
import site.pathos.domain.model.enums.ModelType;

@Schema(description = "Training/Inference 요청 메시지 DTO")
public record TrainingResultRequestDto(
        @Schema(description = "학습 기록 ID", example = "1")
        Long trainingHistoryId,

        @Schema(description = "추론 기록 ID", example = "1")
        Long inferenceHistoryId,

        @Schema(description = "요청 타입", example = "TRAINING_INFERENCE")
        ModelRequestType type,

        @Schema(description = "모델 종류", example = "MULTI")
        ModelType modelType,

        @Schema(description = "모델 이름", example = "custom-model-v1")
        String modelName,

        Long newModelId,

        @Schema(description = "생성된 티슈 모델 경로", example = "s3://my-bucket/models/deep-lab-v1.pt")
        String tissueModelPath,

        @Schema(description = "생성된 셀 모델 경로", example = "s3://my-bucket/models/nulite-v1.pt")
        String cellModelPath,

        @Schema(description = "모델 라벨 정보 목록")
        List<LabelInfo> labels,

        @Schema(description = "SubProject 정보 목록")
        List<SubProjectInfo> subProjects,

        @Schema(description = "모델 성능 지표")
        Performance performance
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

                @Schema(description = "ROI 리스트")
                List<Roi> roi
        ) {}

        @Schema(description = "ROI 정보")
        public record Roi(
                @Schema(description = "ROI 아이디", example = "1")
                Long roiId,

                @Schema(description = "표시 순서", example = "0")
                int displayOrder,

                @Schema(description = "ROI 영역 정보")
                RoiDetail detail,

                @Schema(description = "ROI faulty 백분율")
                int faulty,

                @Schema(description = "조직 이미지 경로 (merged)", example = "s3://my-bucket/sub-project/101/roi-1/merged.jpg")
                String tissuePath,

                @Schema(description = "셀 정보 목록")
                List<Cell> cells
        ) {}

        @Schema(description = "ROI의 위치 정보")
        public record RoiDetail(
                @Schema(description = "X 좌표", example = "0")
                int x,

                @Schema(description = "Y 좌표", example = "0")
                int y,

                @Schema(description = "너비", example = "500")
                int width,

                @Schema(description = "높이", example = "500")
                int height
        ) {}

        @Schema(description = "셀 정보")
        public record Cell(
                @Schema(description = "클래스 인덱스", example = "0")
                int classIndex,

                @Schema(description = "세포 외곽을 구성하는 폴리곤 좌표")
                PolygonDto polygon
        ) {}

        @Schema(description = "Polygon 좌표 정보 DTO")
        public record PolygonDto(
                @Schema(description = "꼭짓점 좌표 리스트", example = "[{\"x\":123,\"y\":456}, {\"x\":124,\"y\":457}]")
                List<PointDto> points
        ) {}

        @Schema(description = "2D 평면의 좌표")
        public record PointDto(
                @Schema(description = "X 좌표", example = "123")
                int x,

                @Schema(description = "Y 좌표", example = "456")
                int y
        ) {}

        public record Performance(
                @Schema(description = "정확도", example = "0.95")
                float accuracy,

                @Schema(description = "손실값", example = "0.23")
                float loss,

                @Schema(description = "반복 성능 점수", example = "0.88")
                float loopPerformance
        ) {}
}
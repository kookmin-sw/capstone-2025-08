package site.pathos.domain.project.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.model.entity.ModelType;
import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;

import java.util.List;

@Schema(description = "프로젝트 어노테이션 화면을 조회할 때 사용하는 응답 DTO")
public record GetProjectAnnotationResponseDto(

        @Schema(description = "프로젝트 ID", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 제목", example = "Upsilon Viz")
        String title,

        @Schema(description = "모델 정보 DTO")
        ModelsDto modelsDto,

        @Schema(description = "프로젝트 라벨 리스트")
        List<LabelDto> labels,

        @Schema(description = "서브 프로젝트 요약 정보 리스트")
        List<SubProjectSummaryDto> subProjects,

        FirstSubProjectLatestAnnotation firstSubProjectLatestAnnotation
) {
        @Schema(description = "프로젝트에서 사용 가능한 모델 목록 DTO")
        public record ModelsDto(
                @Schema(description = "모델 타입", example = "TISSUE")
                ModelType modelType,

                @Schema(description = "프로젝트에 연결된 모델 목록")
                List<ProjectModelsDto> projectModels
        ) {}

        @Schema(description = "단일 모델 정보 DTO")
        public record ProjectModelsDto(
                @Schema(description = "모델 ID", example = "5")
                Long modelId,

                @Schema(description = "모델 이름", example = "Cancer Classifier v1")
                String name
        ) {}

        @Schema(description = "프로젝트에서 사용되는 라벨 정보 DTO")
        public record LabelDto(
                @Schema(description = "라벨 ID", example = "2")
                Long labelId,

                @Schema(description = "라벨 이름", example = "Tumor Region")
                String name,

                @Schema(description = "라벨 색상 (HEX 코드)", example = "#FF5733")
                String color
        ) {}

        public record FirstSubProjectLatestAnnotation(
                Long subProjectId,

                AnnotationHistoryResponseDto latestAnnotationHistory
        ){}

        public record AnnotationHistoryResponseDto(
                @Schema(description = "Annotation History의 ID", example = "1")
                Long annotationHistoryId,

                @Schema(description = "ROI 데이터 목록")
                List<RoiResponsePayload> roiPayloads
        ) {}

        public record RoiResponsePayload(
                @Schema(description = "ROI의 표시 순서", example = "1")
                int displayOrder,

                @Schema(description = "ROI의 위치 및 크기 정보")
                RoiResponseDto detail,

                @Schema(
                        description = "조직 주석 이미지 경로 목록",
                        example = "[\"sub-project/1/annotation-history/2/roi-3/train/tissue1.png\", \"sub-project/1/annotation-history/2/roi-3/train/tissue2.png\"]"
                )
                List<String> tissue_path,

                @Schema(description = "세포 위치 정보 목록")
                List<CellDetail> cell
        ) {}

        public record RoiResponseDto(
                @Schema(description = "ROI ID", example = "1")
                Long id,

                @Schema(description = "ROI의 X 좌표", example = "100")
                int x,

                @Schema(description = "ROI의 Y 좌표", example = "200")
                int y,

                @Schema(description = "ROI의 너비", example = "512")
                int width,

                @Schema(description = "ROI의 높이", example = "512")
                int height,

                @Schema(description = "ROI의 결함 백분율 19", example = "19")
                int faulty
        ) {}

        @Schema(description = "세포 어노테이션 정보")
        public record CellDetail(

                @Schema(description = "세포 클래스 인덱스", example = "0")
                int classIndex,

                @Schema(description = "세포 색상 (Hex)", example = "#FF0000")
                String color,

                @Schema(description = "세포 외곽 폴리곤 정보")
                PolygonDto polygon

        ) {}

        @Schema(description = "Polygon 좌표 정보")

        public record PolygonDto(

                @Schema(description = "꼭짓점 좌표 리스트", example = "[{\"x\":123,\"y\":456}, {\"x\":124,\"y\":457}]")
                List<PointDto> points

        ) {}

        @Schema(description = "2D 평면 상의 좌표")
        public record PointDto(

                @Schema(description = "X 좌표", example = "123")
                int x,

                @Schema(description = "Y 좌표", example = "456")
                int y
        ) {}
}
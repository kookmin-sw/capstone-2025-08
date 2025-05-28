package site.pathos.domain.annotation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

public record RoiLabelSaveRequestDto(
        @Schema(description = "ROI 정보 리스트")
        List<RoiSaveRequestDto> rois,

        @Schema(description = "라벨 정보 리스트")
        List<LabelDto> labels

) {
        public record RoiSaveRequestDto(
                Long roiId,
                Integer x,
                Integer y,
                Integer width,
                Integer height,
                List<String> imageNames,
                @Schema(description = "CellAnnotation 정보 리스트")
                List<CellDto> cells
        ) {}

        public record CellDto(
                @Schema(description = "사용한 라벨의 아이디", example = "0")
                int labelId,

                @Schema(description = "폴리곤 좌표 리스트")
                List<PointDto> polygon
        ) {}

        public record PointDto(
                @Schema(description = "X 좌표", example = "123")
                int x,

                @Schema(description = "Y 좌표", example = "456")
                int y
        ) {}

        public record LabelDto(
                @Schema(description = "라벨 ID. 생성 시 null, 수정 시 값 필요", example = "1")
                Long id,

                @Schema(description = "라벨 이름", example = "Cancer Cell")
                String name,

                @Schema(description = "라벨 색상 (HEX 코드)", example = "#FF5733")
                String color,

                @Schema(description = "정렬 순서", example = "2")
                int displayOrder,

                @Schema(description = "생성 일자")
                LocalDateTime createdAt
        ) {
        }
}
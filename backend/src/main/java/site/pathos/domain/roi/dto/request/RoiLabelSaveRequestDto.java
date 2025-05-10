package site.pathos.domain.roi.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.label.dto.LabelDto;

import java.util.List;

public record RoiLabelSaveRequestDto(

        @Schema(description = "ROI 정보 리스트")
        List<RoiSaveRequestDto> rois,

        @Schema(description = "라벨 정보 리스트")
        List<LabelDto> labels

) {}
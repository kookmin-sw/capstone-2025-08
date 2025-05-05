package site.pathos.domain.roi.dto.response;

import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;

import java.util.List;

public record RoiResponsePayload(
        RoiResponseDto detail,
        List<String> tissue_path,
        List<CellDetail> cell
) {
}

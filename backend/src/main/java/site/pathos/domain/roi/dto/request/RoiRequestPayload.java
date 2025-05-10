package site.pathos.domain.roi.dto.request;

import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;

import java.util.List;

public record RoiRequestPayload(
        int displayOrder,
        RoiRequestDto detail,
        List<String> tissue_path,
        List<CellDetail> cell
) {}

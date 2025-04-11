package site.pathos.domain.modelServer.dto.request;

import site.pathos.domain.annotation.cellAnnotation.dto.CellDetail;
import site.pathos.domain.roi.dto.request.RoiDetail;

import java.util.List;

public record RoiPayload(
        RoiDetail detail,
        String tissue_path,
        List<CellDetail> cell
) {}

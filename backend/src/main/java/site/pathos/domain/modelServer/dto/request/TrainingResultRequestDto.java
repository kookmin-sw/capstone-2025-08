package site.pathos.domain.modelServer.dto.request;

import site.pathos.domain.roi.dto.request.RoiPayload;

import java.util.List;

public record TrainingResultRequestDto(
        Long sub_project_id,
        Long annotation_history_id,
        String model_path,
        List<RoiPayload> roi
) { }

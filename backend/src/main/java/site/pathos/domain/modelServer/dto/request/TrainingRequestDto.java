package site.pathos.domain.modelServer.dto.request;

import java.util.List;

public record TrainingRequestDto(
        Long sub_project_id,
        Long annotation_history_id,
        String type,
        String model_name,
        String model_path,
        String svs_path,
        List<RoiPayload> roi
) {}
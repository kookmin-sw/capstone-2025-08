package site.pathos.domain.modelServer.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.domain.roi.dto.request.RoiRequestPayload;

import java.util.List;

public record TrainingResultRequestDto(

        @Schema(description = "학습된 모델이 저장된 경로", example = "s3://{bucket-name}/trained/model_101.pt", required = true)
        String model_path,

        @Schema(description = "학습 결과 ROI 정보 리스트", required = true)
        List<RoiRequestPayload> roi

) { }
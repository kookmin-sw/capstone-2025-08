package site.pathos.domain.model.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.model.dto.InferenceResultRequestDto;
import site.pathos.domain.model.dto.TrainingRequestDto;
import site.pathos.domain.model.dto.TrainingResultRequestDto;
import site.pathos.domain.model.service.ModelServerService;

@RestController
@RequestMapping("/api/model-server")
@RequiredArgsConstructor
@Tag(name = "Model Server API", description = "모델 학습 및 결과 전달 API")
public class ModelServerController {

    private final ModelServerService modelServerService;

    @Operation(summary = "모델 학습 요청", description = "클라이언트가 모델 서버에 학습을 요청합니다.")
    @PostMapping("/training/{projectId}")
    public ResponseEntity<Void> requestTraining(
            @Parameter(description = "학습을 요청할 project ID", required = true)
            @PathVariable Long projectId,
            @RequestBody TrainingRequestDto trainingRequestDto)
    {
        modelServerService.requestTraining(projectId, trainingRequestDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/training/result")
    @Operation(summary = "모델 학습 결과 수신", description = "모델 서버가 학습 결과를 서버에 전달합니다.")
    public ResponseEntity<Void> responseTraining(
            @Parameter(description = "어노테이션 히스토리 ID") @PathVariable Long projectId,
            @Parameter(description = "모델 학습 결과 데이터", required = true)
            @RequestBody TrainingResultRequestDto resultRequestDto) {

        modelServerService.resultTraining(projectId, resultRequestDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/inference")
    @Operation(summary = "모델 추론 요청", description = "프론트에서 프로젝트 ID만 넘기면, 백엔드가 추론 요청을 보냅니다.")
    public ResponseEntity<Void> requestInference(
            @Parameter(description = "프로젝트 ID") @PathVariable Long projectId) {

        modelServerService.requestInference(projectId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/inference/result")
    @Operation(summary = "모델 추론 결과 수신", description = "모델 서버가 추론 결과를 서버에 전달합니다.")
    public ResponseEntity<Void> responseInference(
            @Parameter(description = "프로젝트 ID") @PathVariable Long projectId,
            @RequestBody InferenceResultRequestDto resultRequestDto) {

        modelServerService.resultInference(projectId, resultRequestDto);
        return ResponseEntity.ok().build();
    }
}
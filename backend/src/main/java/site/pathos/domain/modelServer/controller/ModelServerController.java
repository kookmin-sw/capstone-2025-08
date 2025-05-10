package site.pathos.domain.modelServer.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.modelServer.dto.request.TrainingResultRequestDto;
import site.pathos.domain.modelServer.service.ModelServerService;

@RestController
@RequestMapping("/api/model-server")
@RequiredArgsConstructor
@Tag(name = "Model Server API", description = "모델 학습 및 결과 전달 API")
public class ModelServerController {

    private final ModelServerService modelServerService;

    @Operation(summary = "모델 학습 요청", description = "클라이언트가 모델 서버에 학습을 요청합니다.")
    @PostMapping("/training/{annotationHistoryId}")
    public ResponseEntity<Void> requestTraining(
            @Parameter(description = "학습을 요청할 AnnotationHistory ID", required = true)
            @PathVariable Long annotationHistoryId) {
        modelServerService.requestTraining(annotationHistoryId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/annotation-histories/{annotationHistoryId}/training/result")
    @Operation(summary = "모델 학습 결과 수신", description = "모델 서버가 학습 결과를 서버에 전달합니다.")
    public ResponseEntity<Void> responseTraining(
            @Parameter(description = "어노테이션 히스토리 ID") @PathVariable Long annotationHistoryId,
            @Parameter(description = "모델 학습 결과 데이터", required = true)
            @RequestBody TrainingResultRequestDto resultRequestDto) {

        modelServerService.resultTraining(annotationHistoryId, resultRequestDto);
        return ResponseEntity.ok().build();
    }
}
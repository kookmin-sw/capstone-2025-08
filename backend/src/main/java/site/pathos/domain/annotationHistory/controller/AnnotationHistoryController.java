package site.pathos.domain.annotationHistory.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistoryResponseDto;
import site.pathos.domain.annotationHistory.service.AnnotationHistoryService;

@RestController
@RequestMapping("/api/annotation-histories")
@RequiredArgsConstructor
@Tag(name = "Annotation History API", description = "어노테이션 히스토리 관리 API")
public class AnnotationHistoryController {

    private final AnnotationHistoryService annotationHistoryService;

    @Operation(summary = "모델 이름 수정", description = "Annotation History에 연결된 모델의 이름을 수정합니다.")
    @PatchMapping("/{annotationHistoryId}/model-name")
    public ResponseEntity<Void> updateModelName(
            @Parameter(description = "Annotation History ID", example = "1")
            @PathVariable("annotationHistoryId") Long annotationHistoryId,

            @Parameter(description = "수정할 모델 이름", example = "My Custom Model")
            @RequestParam("name") String modelName
    ) {
        annotationHistoryService.updateModelName(annotationHistoryId, modelName);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Annotation History 상세 조회", description = "특정 Annotation History의 상세 정보를 조회합니다.")
    @GetMapping("/{annotationHistoryId}")
    public ResponseEntity<AnnotationHistoryResponseDto> getAnnotationHistory(
            @Parameter(description = "Annotation History ID", example = "1")
            @PathVariable("annotationHistoryId") Long annotationHistoryId) {
        AnnotationHistoryResponseDto response = annotationHistoryService.getAnnotationHistory(annotationHistoryId);
        return ResponseEntity.ok(response);
    }
}
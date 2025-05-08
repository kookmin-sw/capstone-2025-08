package site.pathos.domain.annotationHistory.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.annotationHistory.dto.response.AnnotationHistoryResponseDto;
import site.pathos.domain.annotationHistory.service.AnnotationHistoryService;

@RestController
@RequestMapping("/api/annotation-histories")
@RequiredArgsConstructor
public class AnnotationHistoryController {

    private final AnnotationHistoryService annotationHistoryService;

    @PatchMapping("/{annotationHistoryId}/model-name")
    public ResponseEntity<Void> updateModelName(
            @PathVariable("annotationHistoryId") Long annotationHistoryId,
            @RequestParam("name") String modelName
    ) {
        annotationHistoryService.updateModelName(annotationHistoryId, modelName);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{annotationHistoryId}")
    public ResponseEntity<AnnotationHistoryResponseDto> getAnnotationHistory(
            @PathVariable("annotationHistoryId") Long annotationHistoryId) {
        AnnotationHistoryResponseDto response = annotationHistoryService.getAnnotationHistory(annotationHistoryId);
        return ResponseEntity.ok(response);
    }
}

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

    @PatchMapping("/{id}/model-name")
    public ResponseEntity<Void> updateModelName(
            @PathVariable("id") Long annotationHistoryId,
            @RequestParam("name") String modelName
    ) {
        annotationHistoryService.updateModelName(annotationHistoryId, modelName);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnotationHistoryResponseDto> getAnnotationHistory(
            @PathVariable("id") Long historyId) {
        AnnotationHistoryResponseDto response = annotationHistoryService.getAnnotationHistory(historyId);
        return ResponseEntity.ok(response);
    }
}

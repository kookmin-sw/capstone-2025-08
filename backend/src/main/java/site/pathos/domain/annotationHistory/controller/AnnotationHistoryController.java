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

    @Operation(summary = "Annotation History 상세 조회", description = "특정 Annotation History의 상세 정보를 조회합니다.")
    @GetMapping("/{annotationHistoryId}")
    public ResponseEntity<AnnotationHistoryResponseDto> getAnnotationHistory(
            @Parameter(description = "Annotation History ID", example = "1")
            @PathVariable("annotationHistoryId") Long annotationHistoryId) {
        AnnotationHistoryResponseDto response = annotationHistoryService.getAnnotationHistory(annotationHistoryId);
        return ResponseEntity.ok(response);
    }
}
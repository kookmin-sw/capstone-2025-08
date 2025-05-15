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

}
package site.pathos.domain.annotationHistory.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/annotation-histories")
@RequiredArgsConstructor
@Tag(name = "Annotation History API", description = "어노테이션 히스토리 관리 API")
public class AnnotationHistoryController {

}
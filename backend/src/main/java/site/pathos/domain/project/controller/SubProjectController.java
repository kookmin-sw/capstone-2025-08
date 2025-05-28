package site.pathos.domain.project.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SubProject API", description = "서브 프로젝트 관련 API")
@RestController
@RequestMapping("/api/subprojects")
@RequiredArgsConstructor
public class SubProjectController {
}
package site.pathos.domain.subProject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.subProject.dto.response.SubProjectResponseDto;
import site.pathos.domain.subProject.service.SubProjectService;

@Tag(name = "SubProject API", description = "서브 프로젝트 관련 API")
@RestController
@RequestMapping("/api/subprojects")
@RequiredArgsConstructor
public class SubProjectController {
}
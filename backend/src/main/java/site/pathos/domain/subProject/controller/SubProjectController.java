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

    private final SubProjectService subProjectService;

    @Operation(summary = "서브 프로젝트 상세 조회", description = "서브 프로젝트 ID로 해당 서브 프로젝트의 상세 정보를 조회합니다.")
    @GetMapping("/{subProjectId}")
    public ResponseEntity<SubProjectResponseDto> getSubProject(
            @Parameter(description = "조회할 서브 프로젝트의 ID", example = "1")
            @PathVariable("subProjectId") Long subProjectId
    ) {
        SubProjectResponseDto response = subProjectService.getSubProject(subProjectId);
        return ResponseEntity.ok(response);
    }
}
package site.pathos.domain.project.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.project.dto.response.ProjectDetailDto;
import site.pathos.domain.project.service.ProjectService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDetailDto> getProjectDetail(
            @PathVariable Long projectId
    ) {
        ProjectDetailDto response = projectService.getProjectDetail(projectId);
        return ResponseEntity.ok(response);
    }
}
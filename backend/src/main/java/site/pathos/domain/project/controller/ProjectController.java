package site.pathos.domain.project.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.project.dto.request.CreateProjectRequestDto;
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

    @PostMapping
    public ResponseEntity<Void> createProject(
            @RequestPart CreateProjectRequestDto requestDto,
            @RequestPart List<MultipartFile> files
    ) {
        projectService.createProject(requestDto, files);
        return ResponseEntity.ok().build();
    }
}
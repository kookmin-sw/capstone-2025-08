package site.pathos.domain.project.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.project.dto.response.GetProjectDetailResponseDto;
import site.pathos.domain.project.dto.request.CreateProjectRequestDto;
import site.pathos.domain.project.dto.request.UpdateProjectRequestDto;
import site.pathos.domain.project.dto.response.GetProjectsResponseDto;
import site.pathos.domain.project.dto.response.GetSubProjectResponseDto;
import site.pathos.domain.project.enums.ProjectSortType;
import site.pathos.domain.project.service.ProjectService;

@Tag(name = "Project API", description = "프로젝트 기능 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "프로젝트를 생성합니다.")
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Void> createProject(
            @RequestPart CreateProjectRequestDto requestDto,
            @RequestPart List<MultipartFile> files
    ) {
        projectService.createProject(requestDto, files);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<GetProjectsResponseDto> getProjects(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "sort", defaultValue = ProjectSortType.DEFAULT_SORT) String sort,
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                projectService.getProjects(search, ProjectSortType.getByDisplayName(sort), page)
        );
    }

    @Operation(summary = "프로젝트의 이름과 설명을 수정합니다.")
    @PatchMapping("/{projectId}")
    public ResponseEntity<Void> updateProject(
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequestDto requestDto
    ) {
        projectService.updateProject(projectId, requestDto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트를 삭제합니다.")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long projectId
    ) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트 상세 화면을 조회합니다.")
    @GetMapping("/{projectId}")
    public ResponseEntity<GetProjectDetailResponseDto> getProjectDetail(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                projectService.getProjectDetail(projectId)
        );
    }
}
package site.pathos.domain.subProject.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.subProject.dto.response.SubProjectResponseDto;
import site.pathos.domain.subProject.service.SubProjectService;

@RestController
@RequestMapping("/api/subprojects")
@RequiredArgsConstructor
public class SubProjectController {

    private final SubProjectService subProjectService;

    @GetMapping("/{subProjectId}")
    public ResponseEntity<SubProjectResponseDto> getSubProject(
            @PathVariable("subProjectId") Long subProjectId
    ){
        SubProjectResponseDto response = subProjectService.getSubProject(subProjectId);
        return ResponseEntity.ok(response);
    }
}

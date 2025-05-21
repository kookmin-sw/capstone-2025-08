package site.pathos.domain.sharedProject.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.sharedProject.dto.request.CreateSharedProjectDto;
import site.pathos.domain.sharedProject.dto.response.GetProjectWithModelsResponseDto;
import site.pathos.domain.sharedProject.service.PublicSpaceService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public-space")
public class PublicSpaceController {

    private final PublicSpaceService publicSpaceService;

    @PostMapping
    public ResponseEntity<Long> createPost(
            @RequestPart("requestDto") CreateSharedProjectDto requestDto,
            @RequestPart("originalImages") List<MultipartFile> originalImages,
            @RequestPart("resultingImages") List<MultipartFile> resultingImages
            ) {
        publicSpaceService.createSharedProject(requestDto, originalImages, resultingImages);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/project-models")
    public ResponseEntity<GetProjectWithModelsResponseDto> getProjectWithModels(){
        GetProjectWithModelsResponseDto projects = publicSpaceService.getProjectWithModels();
        return ResponseEntity.ok(projects);
    }
}

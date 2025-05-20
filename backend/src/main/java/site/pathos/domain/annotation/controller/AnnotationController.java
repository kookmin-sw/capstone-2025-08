package site.pathos.domain.annotation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.annotation.dto.response.AnnotationHistoryResponseDto;
import site.pathos.domain.annotation.dto.response.GetProjectAnnotationResponseDto;
import site.pathos.domain.annotation.service.AnnotationService;
import site.pathos.domain.annotation.dto.request.RoiLabelSaveRequestDto;
import site.pathos.global.annotation.FormDataRequestBody;
import site.pathos.domain.project.dto.response.SubProjectResponseDto;

import java.util.List;

@Tag(name = "Project Annotation API", description = "프로젝트 어노테이션 기능 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/annotation")
public class AnnotationController {

    private final AnnotationService annotationService;

    @PostMapping(
            value = "/sub-projects/{subProjectId}/histories/{annotationHistoryId}/save",
            consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}
    )
    @Operation(summary = "ROI, 이미지, 라벨 업로드", description = "특정 SubProject와 AnnotationHistory에 ROI, 관련 이미지, 라벨 정보를 업로드합니다.")
    @FormDataRequestBody
    public ResponseEntity<AnnotationHistoryResponseDto> uploadRois(
            @Parameter(description = "서브 프로젝트 ID", required = true)
            @PathVariable Long subProjectId,

            @Parameter(description = "어노테이션 히스토리 ID", required = true)
            @PathVariable Long annotationHistoryId,

            @Parameter(description = "ROI, 라벨 정보 리스트", required = true)
            @RequestPart("requestDto") RoiLabelSaveRequestDto roiLabelSaveRequestDto,

            @Parameter(description = "ROI에 대응하는 이미지들", required = true)
            @RequestPart("images") List<MultipartFile> images
    ) {
        AnnotationHistoryResponseDto response = annotationService.saveWithAnnotations(subProjectId, annotationHistoryId, roiLabelSaveRequestDto.rois(), images, roiLabelSaveRequestDto.labels());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "프로젝트 어노테이션 페이지를 조회합니다.",
            description = "해당 projectId를 기반으로 프로젝트 단위 정보들과 서브프로젝트들을 반환합니다."
    )
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<GetProjectAnnotationResponseDto> getProject(
            @Parameter(description = "조회할 프로젝트 ID", example = "1")
            @PathVariable Long projectId
    ) {
        GetProjectAnnotationResponseDto response = annotationService.getProjectAnnotation(projectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "서브 프로젝트 상세 조회",
            description = "서브 프로젝트 ID로 해당 서브 프로젝트의 상세 정보를 조회합니다.")
    @GetMapping("/sub-projects/{subProjectId}")
    public ResponseEntity<SubProjectResponseDto> getSubProject(
            @Parameter(description = "조회할 서브 프로젝트의 ID", example = "1")
            @PathVariable("subProjectId") Long subProjectId
    ) {
        SubProjectResponseDto response = annotationService.getSubProject(subProjectId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Annotation History 상세 조회",
            description = "특정 Annotation History의 상세 정보를 조회합니다.")
    @GetMapping("/annotation-histories/{annotationHistoryId}")
    public ResponseEntity<AnnotationHistoryResponseDto> getAnnotationHistory(
            @Parameter(description = "Annotation History ID", example = "1")
            @PathVariable("annotationHistoryId") Long annotationHistoryId) {
        AnnotationHistoryResponseDto response = annotationService.getAnnotationHistory(annotationHistoryId);
        return ResponseEntity.ok(response);
    }
}



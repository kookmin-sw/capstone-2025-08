package site.pathos.domain.sharedProject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.sharedProject.dto.request.CreateCommentRequestDto;
import site.pathos.domain.sharedProject.dto.request.CreateSharedProjectDto;
import site.pathos.domain.sharedProject.dto.request.UpdateCommentRequestDto;
import site.pathos.domain.sharedProject.dto.response.GetProjectWithModelsResponseDto;
import site.pathos.domain.sharedProject.dto.response.GetSharedProjectCommentsResponseDto;
import site.pathos.domain.sharedProject.dto.response.GetSharedProjectDetailResponseDto;
import site.pathos.domain.sharedProject.dto.response.GetSharedProjectsResponseDto;
import site.pathos.domain.sharedProject.service.PublicSpaceService;
import site.pathos.global.annotation.FormDataRequestBody;

import java.util.List;

@Tag(name = "Public Space API", description = "퍼블릭 스페이스 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public-space")
public class PublicSpaceController {

    private final PublicSpaceService publicSpaceService;

    @Operation(
            summary = "공유 프로젝트 생성",
            description = "공유 프로젝트를 업로드합니다."
    )
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @FormDataRequestBody
    public ResponseEntity<Long> createPost(
            @RequestPart("requestDto") CreateSharedProjectDto requestDto,
            @RequestPart("originalImages") List<MultipartFile> originalImages,
            @RequestPart("resultImages") List<MultipartFile> resultImages
    ) {
        publicSpaceService.createSharedProject(requestDto, originalImages, resultImages);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "프로젝트 목록 및 관련 모델 조회",
            description = "공유 가능한 프로젝트와 해당 프로젝트의 학습 가능한 모델 목록을 조회합니다."
    )
    @GetMapping("/project-models")
    public ResponseEntity<GetProjectWithModelsResponseDto> getProjectWithModels() {
        GetProjectWithModelsResponseDto response = publicSpaceService.getProjectWithModels();
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "공유 프로젝트 상세 조회",
            description = "특정 공유 프로젝트의 상세 정보를 조회합니다."
    )
    @GetMapping("/shared-projects/{sharedProjectId}")
    public ResponseEntity<GetSharedProjectDetailResponseDto> getSharedProject(
            @Parameter(description = "조회를 요청할 공유 프로젝트 ID", required = true)
            @PathVariable Long sharedProjectId
    ) {
        GetSharedProjectDetailResponseDto response = publicSpaceService.getSharedProjectDetail(sharedProjectId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "공유 프로젝트 목록 조회",
            description = "검색어와 페이지 번호를 기반으로 공유 프로젝트 목록을 조회합니다."
    )
    @GetMapping
    public ResponseEntity<GetSharedProjectsResponseDto> getSharedProjectsResponseDtoResponseEntity(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        GetSharedProjectsResponseDto response = publicSpaceService.getSharedProjects(search, page);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "모델 다운로드",
            description = "특정 공유 프로젝트에서 지정한 모델을 다운로드합니다."
    )
    @PostMapping("/shared-projects/{sharedProjectId}/model-download/{modelId}")
    public ResponseEntity<Void> downloadModel(
            @PathVariable Long sharedProjectId,
            @PathVariable Long modelId
    ){
        publicSpaceService.downloadModel(sharedProjectId, modelId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "댓글 작성",
            description = "특정 공유 프로젝트에 댓글을 작성합니다."
    )
    @PostMapping("/shared-projects/{sharedProjectId}/comments")
    public ResponseEntity<Void> createComment(
            @PathVariable Long sharedProjectId,
            @RequestBody CreateCommentRequestDto createCommentRequestDto
    ){
        publicSpaceService.createComment(sharedProjectId, createCommentRequestDto);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "댓글 조회",
            description = "특정 공유 프로젝트의 댓글 목록을 조회합니다. 대댓글 포함 트리 구조로 반환됩니다."
    )
    @GetMapping("/shared-projects/{sharedProjectId}/comments")
    public ResponseEntity<GetSharedProjectCommentsResponseDto> getComments(
            @PathVariable Long sharedProjectId
    ){
        GetSharedProjectCommentsResponseDto response = publicSpaceService.getSharedProjectComments(sharedProjectId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "댓글 수정",
            description = "댓글 내용을 수정합니다. 본인 댓글만 수정할 수 있습니다."
    )
    @PatchMapping("/shared-projects/{sharedProjectId}/comments/{commentId}")
    public ResponseEntity<Void> updateComment(
            @PathVariable Long sharedProjectId,
            @PathVariable Long commentId,
            @RequestBody UpdateCommentRequestDto updateRequest
    ){
        publicSpaceService.updateComment(sharedProjectId, commentId, updateRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "댓글 삭제",
            description = "댓글을 소프트 삭제합니다. 실제로 DB에서 삭제되지는 않으며, 표시되지 않도록 처리됩니다."
    )
    @DeleteMapping("/shared-projects/{sharedProjectId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long sharedProjectId,
            @PathVariable Long commentId
    ){
        publicSpaceService.deleteComment(sharedProjectId, commentId);
        return ResponseEntity.ok().build();
    }
}
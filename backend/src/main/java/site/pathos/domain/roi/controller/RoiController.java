package site.pathos.domain.roi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.roi.dto.request.RoiLabelSaveRequestDto;
import site.pathos.domain.roi.service.RoiService;

import java.util.List;

@RestController
@RequestMapping("/api/rois")
@RequiredArgsConstructor
@Tag(name = "ROI API", description = "ROI 및 관련 이미지/라벨 업로드 기능 제공")
public class RoiController {

    private final RoiService roiService;

    @PostMapping(
            value = "/sub-projects/{subProjectId}/histories/{annotationHistoryId}",
            consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}
    )
    @Operation(summary = "ROI, 이미지, 라벨 업로드", description = "특정 SubProject와 AnnotationHistory에 ROI, 관련 이미지, 라벨 정보를 업로드합니다.")
    public ResponseEntity<Void> uploadRois(
            @Parameter(description = "서브 프로젝트 ID", required = true)
            @PathVariable Long subProjectId,

            @Parameter(description = "어노테이션 히스토리 ID", required = true)
            @PathVariable Long annotationHistoryId,

            @Parameter(description = "ROI, 라벨 정보 리스트", required = true)
            @RequestPart("requestDto") RoiLabelSaveRequestDto roiLabelSaveRequestDto,

            @Parameter(description = "ROI에 대응하는 이미지들", required = true)
            @RequestPart("images") List<MultipartFile> images
    ) {
        roiService.saveWithAnnotations(subProjectId, annotationHistoryId,
                roiLabelSaveRequestDto.rois(), images, roiLabelSaveRequestDto.labels());
        return ResponseEntity.ok().build();
    }
}

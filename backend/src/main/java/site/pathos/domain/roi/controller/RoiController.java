package site.pathos.domain.roi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.roi.dto.request.RoiSaveRequestDto;
import site.pathos.domain.roi.service.RoiService;

import java.util.List;

@RestController
@RequestMapping("rois")
@RequiredArgsConstructor
public class RoiController {

    private final RoiService roiService;

    @PostMapping
    public ResponseEntity<Void> uploadRois(
            @RequestPart("subProjectId") Long subProjectId,
            @RequestPart("annotationHistoryId") Long annotationHistoryId,
            @RequestPart("rois") List<RoiSaveRequestDto> rois,
            @RequestPart("images") List<MultipartFile> images
    ){
        roiService.saveWithAnnotations(subProjectId, annotationHistoryId, rois, images);
        return ResponseEntity.ok().build();
    }
}

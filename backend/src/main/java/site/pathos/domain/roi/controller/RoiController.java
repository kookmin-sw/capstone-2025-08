package site.pathos.domain.roi.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.roi.service.RoiService;

@RestController
@RequestMapping("/api/rois")
@RequiredArgsConstructor
@Tag(name = "ROI API", description = "ROI 및 관련 이미지/라벨 업로드 기능 제공")
public class RoiController {

    private final RoiService roiService;
}

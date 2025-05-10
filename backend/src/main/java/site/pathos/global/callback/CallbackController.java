package site.pathos.global.callback;

import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.subProject.service.SubProjectService;
import site.pathos.global.callback.dto.request.TilingCallbackRequestDto;

@Hidden
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class CallbackController {

    private final SubProjectService subProjectService;

    @PostMapping("/tiling-complete")
    public void tilingComplete(@RequestBody TilingCallbackRequestDto tilingCallbackRequestDto){
        subProjectService.markTilingAsComplete(tilingCallbackRequestDto.subProjectId());
    }
}

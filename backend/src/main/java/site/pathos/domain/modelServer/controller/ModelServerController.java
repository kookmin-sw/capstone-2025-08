package site.pathos.domain.modelServer.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.pathos.domain.modelServer.dto.request.TrainingResultRequestDto;
import site.pathos.domain.modelServer.service.ModelServerService;

@RestController
@RequestMapping("/api/model-server")
@RequiredArgsConstructor
public class ModelServerController {

    private final ModelServerService modelServerService;

    @PostMapping("/training")
    public ResponseEntity<Void> requestTraining(@RequestParam("annotation_history_id") Long annotationHistoryId) {
        modelServerService.requestTraining(annotationHistoryId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/training/result")
    public ResponseEntity<Void> responseTraining(@RequestBody TrainingResultRequestDto resultRequestDto){

        return ResponseEntity.ok().build();
    }
}
package site.pathos.domain.label.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.label.dto.LabelDto;
import site.pathos.domain.label.entity.Label;
import site.pathos.domain.label.repository.LabelRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;

    @Transactional
    public void upsertLabels(List<LabelDto> labelDtos, AnnotationHistory history) {
        for (LabelDto dto : labelDtos) {
            if (dto.id() == null) {
                // 신규 생성
                Label newLabel = Label.builder()
                        .name(dto.name())
                        .color(dto.color())
                        .annotationHistory(history)
                        .build();
                labelRepository.save(newLabel);
            } else {
                // 기존 항목 수정
                Label existingLabel = labelRepository.findById(dto.id())
                        .orElseThrow(() -> new IllegalArgumentException("Label not found: " + dto.id()));

                existingLabel.changeName(dto.name());
                existingLabel.changeColor(dto.color());
            }
        }
    }
}

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

}

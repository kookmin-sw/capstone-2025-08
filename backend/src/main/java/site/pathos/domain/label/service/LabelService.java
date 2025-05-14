package site.pathos.domain.label.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.pathos.domain.label.repository.LabelRepository;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;

}

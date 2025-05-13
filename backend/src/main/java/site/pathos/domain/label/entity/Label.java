package site.pathos.domain.label.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.label.dto.LabelDto;
import site.pathos.domain.model.entity.Model;

@Entity
@Table(name = "label")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Label {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

}

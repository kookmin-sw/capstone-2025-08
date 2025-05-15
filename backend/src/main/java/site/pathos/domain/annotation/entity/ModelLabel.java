package site.pathos.domain.annotation.entity;

import jakarta.persistence.*;
import lombok.*;
import site.pathos.domain.model.entity.Model;

@Entity
@Table(
        name = "model_label",
        uniqueConstraints = @UniqueConstraint(columnNames = {"model_id", "class_index"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ModelLabel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_label_id", nullable = false)
    private ProjectLabel projectLabel;

    @Column(name = "class_index", nullable = false)
    private Integer classIndex;

    @Builder
    public ModelLabel(Model model, ProjectLabel projectLabel, Integer classIndex){
        this.model = model;
        this.projectLabel = projectLabel;
        this.classIndex = classIndex;
    }
}
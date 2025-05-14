package site.pathos.domain.label.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.project.entity.Project;

@Entity
@Table(
        name = "project_label",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "label_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectLabel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "label_id", nullable = false)
    private Label label;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "color", nullable = false)
    private String color;

    @Builder
    public ProjectLabel(Project project, Label label, String name, String color){
        this.project = project;
        this.label = label;
        this.name = name;
        this.color = color;
    }

    public void changeLabel(String color, String name){
        this.color = color;
        this.name = name;
    }
}
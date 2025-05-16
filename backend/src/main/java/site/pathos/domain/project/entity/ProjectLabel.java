package site.pathos.domain.project.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.annotation.entity.Label;

import java.time.LocalDateTime;

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

    @Column(name = "displayer_order",nullable = false)
    private int displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Builder
    public ProjectLabel(Project project, Label label, String name, String color
            , int displayOrder, LocalDateTime createdAt){
        this.project = project;
        this.label = label;
        this.name = name;
        this.color = color;
        this.displayOrder = displayOrder;
        this.createdAt = createdAt;
    }

    public void changeLabel(String color, String name, int displayOrder){
        this.color = color;
        this.name = name;
        this.displayOrder = displayOrder;
    }
}
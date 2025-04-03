package site.pathos.domain.subProject;

import jakarta.persistence.*;
import site.pathos.domain.project.entity.Project;

@Entity
@Table(name = "sub_project")
public class SubProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "svs_image_url")
    private String svsImageUrl;
}

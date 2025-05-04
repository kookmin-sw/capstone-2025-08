package site.pathos.domain.subProject.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.project.entity.Project;

@Entity
@Table(name = "sub_project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SubProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "svs_image_url")
    private String svsImageUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Builder
    public SubProject(Project project) {
        this.project = project;
    }

    public String initializeSvsImageUrl() {
        if (this.id == null) {
            throw new IllegalStateException("SubProject ID must be set before initializing svsImageUrl.");
        }
        return this.svsImageUrl = String.format("sub-project/%s/svs/original.svs", this.id);
    }
}

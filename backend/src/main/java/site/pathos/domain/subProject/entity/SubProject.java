package site.pathos.domain.subProject.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
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

    @OneToMany(mappedBy = "subProject", fetch = FetchType.LAZY)
    private List<AnnotationHistory> annotationHistories = new ArrayList<>();

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

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
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import site.pathos.domain.annotationHistory.entity.AnnotationHistory;
import site.pathos.domain.project.entity.Project;

@Entity
@Table(name = "sub_project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLRestriction("is_deleted = false")
public class SubProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToMany(mappedBy = "subProject", fetch = FetchType.LAZY)
    private List<AnnotationHistory> annotationHistories = new ArrayList<>();

    @Column(name = "svs_image_path")
    private String svsImagePath;

    @Column(name = "tile_image_path")
    private String tileImagePath;

    @Column(name = "thumbnail_path")
    private String thumbnailPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_upload_complete", nullable = false)
    private boolean isUploadComplete;

    @Builder
    public SubProject(Project project) {
        this.project = project;
        this.isUploadComplete = false;
    }

    public String initializeSvsImagePath() {
        if (this.id == null) {
            throw new IllegalStateException("SubProject ID must be set before initializing svsImageUrl.");
        }
        return this.svsImagePath = String.format("sub-project/%s/svs/original.svs", this.id);
    }

    public String getFileName() {
        return Paths.get(svsImagePath).getFileName().toString();
    }

    public String initializeThumbnailImagePath() {
        if (this.id == null) {
            throw new IllegalStateException("SubProject ID must be set before initializing thumbnailImageUrl.");
        }
        return this.thumbnailPath = String.format("sub-project/%s/thumbnail/thumbnail.jpg", this.id);
    }

    public String initializeTileImagePath() {
        if (this.id == null) {
            throw new IllegalStateException("SubProject ID must be set before initializing tileImageUrl.");
        }
        return this.tileImagePath = String.format("sub-project/%s/tiles/output_slide.dzi", this.id);

    }

    public void markTilingCompleted() {
        this.isUploadComplete = true;
    }
}

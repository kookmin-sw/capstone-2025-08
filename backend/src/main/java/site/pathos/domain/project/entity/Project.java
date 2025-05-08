package site.pathos.domain.project.entity;

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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import site.pathos.domain.model.entity.ModelType;
import site.pathos.domain.subProject.entity.SubProject;
import site.pathos.domain.user.entity.User;

@Entity
@Table(name = "project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLRestriction("is_deleted = false")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    private List<SubProject> subProjects = new ArrayList<>();

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "model_type" , nullable = false)
    private ModelType modelType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public Project(User user, String title, String description, ModelType modelType) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.modelType = modelType;
        setUpdatedAt();
    }

    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateDetail(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public void delete() {
        if (!this.isDeleted) {
            this.isDeleted = true;
            this.deletedAt = LocalDateTime.now();
        }
    }
}

package site.pathos.domain.sharedProject.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.user.entity.User;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shared_project")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "thumbnail_image_path", nullable = false)
    private String thumbnailImagePath;

    @OneToMany(mappedBy = "sharedProject", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tag> tags = new ArrayList<>();

    @Column(name = "download_count", nullable = false)
    private long downloadCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @CreationTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public SharedProject(User user,  Model model, String title, String description,
                         String thumbnailImagePath){
        this.user = user;
        this.model = model;
        this.title = title;
        this.description = description;
        this.downloadCount = 0;
    }

    public void assignThumbnailPath(String thumbnailImagePath){
        this.thumbnailImagePath = thumbnailImagePath;
    }

    public void incrementDownloadCount() {
        this.downloadCount++;
    }
}

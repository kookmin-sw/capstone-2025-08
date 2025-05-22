package site.pathos.domain.sharedProject.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "download_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DownloadLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_project_id", nullable = false)
    private SharedProject sharedProject;

    @CreationTimestamp
    @Column(name = "downloaded_at", nullable = false)
    private LocalDateTime downloadedAt;

    @Builder
    public DownloadLog(User user, SharedProject sharedProject, LocalDateTime downloadedAt) {
        this.user = user;
        this.sharedProject = sharedProject;
        this.downloadedAt = downloadedAt;
    }
}

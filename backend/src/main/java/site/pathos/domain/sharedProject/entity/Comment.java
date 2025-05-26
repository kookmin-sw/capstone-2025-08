package site.pathos.domain.sharedProject.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.pathos.domain.sharedProject.enums.CommentTag;
import site.pathos.domain.user.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_project_id", nullable = false)
    private SharedProject sharedProject;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "comment_tag", nullable = false)
    private CommentTag commentTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public Comment(User user, SharedProject sharedProject, String content, Comment parentComment, CommentTag commentTag){
        this.user = user;
        this.sharedProject = sharedProject;
        this.content = content;
        this.parentComment = parentComment;
        this.commentTag = commentTag;
    }
}

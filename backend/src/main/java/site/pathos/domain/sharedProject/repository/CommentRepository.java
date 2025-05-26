package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.sharedProject.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}

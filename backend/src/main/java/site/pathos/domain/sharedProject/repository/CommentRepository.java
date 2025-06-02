package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.sharedProject.entity.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
            SELECT c
            FROM Comment c
            JOIN FETCH c.user
            WHERE c.sharedProject.id = :sharedProjectId
            order by c.createdAt ASC
            """)
    List<Comment> findAllBySharedProjectIdWithUserOrderByCreatedAtAsc(@Param("sharedProjectId") Long sharedProjectId);
}

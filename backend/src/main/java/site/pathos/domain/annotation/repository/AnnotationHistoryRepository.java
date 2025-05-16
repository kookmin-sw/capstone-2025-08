package site.pathos.domain.annotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.annotation.entity.AnnotationHistory;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnotationHistoryRepository extends JpaRepository<AnnotationHistory, Long> {
    List<AnnotationHistory> findAllBySubProjectId(Long subProjectId);

    @Query("""
        SELECT DISTINCT ah FROM AnnotationHistory ah
        WHERE ah IN :annotationHistories
    """)
    List<AnnotationHistory> fetchAnnotationHistories(
            @Param("annotationHistories") List<AnnotationHistory> annotationHistories
    );

    @Query("""
    SELECT ah FROM AnnotationHistory ah
    WHERE ah.subProject.id = :subProjectId
    ORDER BY ah.updatedAt DESC
""")
    Optional<AnnotationHistory> findLatestBySubProjectId(@Param("subProjectId") Long subProjectId);

    Optional<AnnotationHistory> findFirstBySubProjectIdOrderByUpdatedAtDesc(Long subProjectId);

    @Query("""
    SELECT ah FROM AnnotationHistory ah
    JOIN FETCH ah.subProject sp
    JOIN FETCH sp.project p
    WHERE ah.id = :annotationHistoryId
""")
    Optional<AnnotationHistory> findWithProjectById(@Param("annotationHistoryId") Long annotationHistoryId);
}
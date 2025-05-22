package site.pathos.domain.sharedProject.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import site.pathos.domain.sharedProject.entity.SharedProject;
public interface SharedProjectRepository extends JpaRepository<SharedProject, Long> {
    Page<SharedProject> findAll(Pageable pageable);

    @Query("""
    SELECT DISTINCT sp FROM SharedProject sp
    LEFT JOIN sp.tags t
    WHERE LOWER(sp.title) LIKE LOWER(CONCAT('%', :search, '%'))
       OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))
""")
    Page<SharedProject> searchByTitleOrTag(@Param("search") String search, Pageable pageable);
}

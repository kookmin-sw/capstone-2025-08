package site.pathos.domain.model.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.Model;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
}

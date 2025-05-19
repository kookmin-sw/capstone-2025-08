package site.pathos.domain.annotation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.annotation.entity.Label;

public interface LabelRepository extends JpaRepository<Label, Long> {
}

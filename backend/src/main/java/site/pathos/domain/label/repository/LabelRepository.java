package site.pathos.domain.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.label.entity.Label;

import java.util.List;

public interface LabelRepository extends JpaRepository<Label, Long> {
}

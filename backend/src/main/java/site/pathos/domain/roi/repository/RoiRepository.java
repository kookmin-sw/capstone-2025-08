package site.pathos.domain.roi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.roi.entity.Roi;

@Repository
public interface RoiRepository extends JpaRepository<Roi, Long> {
}
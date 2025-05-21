package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.sharedProject.entity.DataSet;

public interface DataSetRepository extends JpaRepository<DataSet, Long> {
}

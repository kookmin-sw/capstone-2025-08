package site.pathos.domain.sharedProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import site.pathos.domain.sharedProject.entity.DataSet;
import site.pathos.domain.sharedProject.enums.DataType;

import java.util.List;

public interface DataSetRepository extends JpaRepository<DataSet, Long> {
    List<DataSet> findAllBySharedProjectIdAndDataType(Long sharedProjectId, DataType dataType);
}

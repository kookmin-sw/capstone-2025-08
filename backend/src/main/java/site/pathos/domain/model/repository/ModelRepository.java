package site.pathos.domain.model.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.enums.ModelType;
import site.pathos.domain.user.entity.User;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    @Query("""
    SELECT m FROM UserModel um
    JOIN um.model m
    WHERE um.user = :user
      AND m.trainingHistory IS NULL
      AND m.modelType = :modelType
      AND m.tissueModelPath IS NOT NULL
      AND m.cellModelPath IS NULL
    ORDER BY m.trainedAt DESC
    """)
    Optional<Model> findFirstTissueModelByUser(@Param("modelType") ModelType modelType, @Param("user") User user);


    @Query("""
    SELECT m FROM UserModel um
    JOIN um.model m
    WHERE um.user = :user
      AND m.trainingHistory IS NULL
      AND m.modelType = :modelType
      AND m.cellModelPath IS NOT NULL
      AND m.tissueModelPath IS NULL
    ORDER BY m.trainedAt DESC
    """)
    Optional<Model> findFirstCellModelByUser(@Param("modelType") ModelType modelType, @Param("user") User user);


    @Query("""
    SELECT m FROM UserModel um
    JOIN um.model m
    WHERE um.user = :user
      AND m.trainingHistory IS NULL
      AND m.modelType = :modelType
      AND m.cellModelPath IS NOT NULL
      AND m.tissueModelPath IS NOT NULL
    ORDER BY m.trainedAt DESC
    """)
    Optional<Model> findFirstMultiModelByUser(@Param("modelType") ModelType modelType, @Param("user") User user);

}

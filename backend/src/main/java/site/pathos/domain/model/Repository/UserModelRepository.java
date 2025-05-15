package site.pathos.domain.model.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import site.pathos.domain.model.entity.Model;
import site.pathos.domain.model.entity.UserModel;

import java.util.List;

@Repository
public interface UserModelRepository extends JpaRepository<UserModel, Long> {
    @Query("SELECT m FROM UserModel u JOIN u.model m WHERE u.user.id = :userId")
    List<Model> findAllModelsByUserId(@Param("userId") Long userId);
}

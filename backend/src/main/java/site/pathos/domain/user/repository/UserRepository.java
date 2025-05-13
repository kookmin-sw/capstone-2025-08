package site.pathos.domain.user.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.enums.SocialType;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findBySocialTypeAndSocialId(SocialType socialType, String socialId);
}

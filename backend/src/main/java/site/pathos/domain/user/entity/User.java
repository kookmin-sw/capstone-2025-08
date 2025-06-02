package site.pathos.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.user.enums.RoleType;
import site.pathos.domain.user.enums.SocialType;

@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "profile_image_path")
    private String profileImagePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleType role;

    @Column(name="social_type", nullable=false)
    @Enumerated(EnumType.STRING)
    private SocialType socialType;

    @Column(name="social_id", nullable=false)
    private String socialId;

    @Builder
    public User(String email, String name, String profileImagePath, RoleType role, SocialType socialType,
                String socialId) {
        this.email = email;
        this.name = name;
        this.profileImagePath = profileImagePath;
        this.role = role;
        this.socialType = socialType;
        this.socialId = socialId;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public String initializeProfileImagePath(MultipartFile image) {
        String originalName = image.getOriginalFilename();
        String fileExtension = originalName.substring(originalName.lastIndexOf("."));
        String profileImagePath = getProfileImagePath(fileExtension);
        return this.profileImagePath = profileImagePath;
    }

    public String initializeProfileImagePath() {
        String defaultFileExtension = ".png";
        String profileImagePath = getProfileImagePath(defaultFileExtension);
        return this.profileImagePath = profileImagePath;
    }

    private String getProfileImagePath(String fileExtension) {
        return "profile/" + id + "/" + UUID.randomUUID() + fileExtension;
    }
}

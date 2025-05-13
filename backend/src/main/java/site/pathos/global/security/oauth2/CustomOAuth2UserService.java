package site.pathos.global.security.oauth2;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.enums.RoleType;
import site.pathos.domain.user.enums.SocialType;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.security.oauth2.userinfo.GoogleUserInfo;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(request);
        GoogleUserInfo info = new GoogleUserInfo(oauth2User.getAttributes());

        User user = findOrCreateUser(info);
        return new CustomOAuth2User(user);
    }

    private User findOrCreateUser(GoogleUserInfo info) {
        Optional<User> optionalUser = userRepository.findBySocialTypeAndSocialId(SocialType.GOOGLE, info.getId());
        if (optionalUser.isPresent()) {
            return optionalUser.get();
        }

        User newUser = User.builder()
                .socialType(SocialType.GOOGLE)
                .socialId(info.getId())
                .email(info.getEmail())
                .name(info.getName())
                .profileImageUrl(info.getPicture())
                .role(RoleType.USER)
                .build();
        return userRepository.save(newUser);
    }
}
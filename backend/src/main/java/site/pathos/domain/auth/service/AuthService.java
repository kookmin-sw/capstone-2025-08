package site.pathos.domain.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.security.jwt.JwtProvider;
import site.pathos.global.security.jwt.JwtTokenDto;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public JwtTokenDto createToken(User user) {
        String accessToken = jwtProvider.createAccessToken(user);
        String refreshToken = jwtProvider.createRefreshToken(user);
        refreshTokenService.store(user.getId(), refreshToken);
        return new JwtTokenDto(accessToken, refreshToken);
    }

    public JwtTokenDto refreshTokens(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        Long userId = jwtProvider.getUserIdFromToken(refreshToken);
        User user = getUser(userId);

        String saved = refreshTokenService.get(userId);
        if (saved == null || !saved.equals(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String newAccessToken = jwtProvider.createAccessToken(user);
        String newRefreshToken = jwtProvider.createRefreshToken(user);
        refreshTokenService.store(userId, newRefreshToken);

        return new JwtTokenDto(newAccessToken, newRefreshToken);
    }

    public void logout(String refreshToken) {
        Long userId = jwtProvider.getUserIdFromToken(refreshToken);
        refreshTokenService.delete(userId);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}

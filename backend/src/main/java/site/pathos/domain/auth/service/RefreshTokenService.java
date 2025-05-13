package site.pathos.domain.auth.service;

import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import site.pathos.global.security.config.TokenProperties;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final StringRedisTemplate redis;
    private final TokenProperties props;

    private String key(Long userId) {
        return props.getRedisRefreshPrefix() + userId;
    }

    public void store(Long userId, String refreshToken) {
        redis.opsForValue().set(
                key(userId),
                refreshToken,
                props.getRefreshTokenExpirationMs(),
                TimeUnit.MILLISECONDS
        );
    }

    public String get(Long userId) {
        return redis.opsForValue().get(key(userId));
    }

    public void delete(Long userId) {
        redis.delete(key(userId));
    }
}

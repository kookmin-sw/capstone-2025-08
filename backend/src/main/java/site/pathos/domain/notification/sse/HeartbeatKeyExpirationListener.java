package site.pathos.domain.notification.sse;

import static site.pathos.domain.notification.constants.NotificationsConstants.*;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
public class HeartbeatKeyExpirationListener implements MessageListener {
    private final EmitterRegistry registry;
    private final RedisTemplate<String, String> redisTemplate;

    @PostConstruct
    public void initialize() {
        redisTemplate.execute((RedisCallback<Void>) connection -> {
            connection.serverCommands().setConfig(NOTIFY_KEYSPACE_EVENTS_CONFIG, EXPIRED_EVENTS_CONFIG_VALUE);
            return null;
        });

        // 최초 heartbeat 설정
        redisTemplate.opsForValue().set(HEARTBEAT_KEY, HEARTBEAT_VALUE, HEARTBEAT_TTL, TimeUnit.SECONDS);
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = new String(message.getBody(), StandardCharsets.UTF_8);
        if (!HEARTBEAT_KEY.equals(expiredKey)) {
            return;
        }

        registry.getAllSnapshot().forEach((userId, list) -> {
            list.forEach(emitter -> {
                try {
                    emitter.send(
                            SseEmitter.event().comment(SSE_HEARTBEAT_COMMENT)
                    );
                } catch (IOException e) {
                    emitter.completeWithError(e);
                    registry.remove(userId, emitter);
                }
            });
        });

        redisTemplate.opsForValue().set(HEARTBEAT_KEY, HEARTBEAT_VALUE, HEARTBEAT_TTL, TimeUnit.SECONDS);
    }
}

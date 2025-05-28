package site.pathos.domain.notification.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisNotificationListener implements MessageListener {
    private final EmitterRegistry registry;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel(), java.nio.charset.StandardCharsets.UTF_8);
        Long userId = Long.valueOf(channel.split("\\.")[1]);
        String payload = new String(message.getBody(), java.nio.charset.StandardCharsets.UTF_8);
        registry.sendToUser(userId, payload);
    }
}

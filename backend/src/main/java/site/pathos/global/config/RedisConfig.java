package site.pathos.global.config;

import static site.pathos.domain.notification.constants.NotificationsConstants.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import site.pathos.domain.notification.sse.HeartbeatKeyExpirationListener;
import site.pathos.domain.notification.sse.RedisNotificationListener;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(LettuceConnectionFactory cf) {
        RedisTemplate<String,String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(cf);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }

    @Bean
    public RedisMessageListenerContainer redisListenerContainer(
            RedisConnectionFactory redisConnectionFactory,
            MessageListenerAdapter notificationListenerAdapter,
            MessageListenerAdapter heartbeatListenerAdapter
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);
        container.addMessageListener(notificationListenerAdapter, new PatternTopic(NOTIFICATION_CHANNEL_PATTERN));
        container.addMessageListener(heartbeatListenerAdapter, new PatternTopic(HEARTBEAT_CHANNEL_PATTERN));
        return container;
    }

    @Bean
    public MessageListenerAdapter notificationListenerAdapter(RedisNotificationListener subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }

    @Bean
    public MessageListenerAdapter heartbeatListenerAdapter(HeartbeatKeyExpirationListener listener) {
        return new MessageListenerAdapter(listener, "onMessage");
    }
}
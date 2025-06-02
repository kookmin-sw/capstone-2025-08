package site.pathos.domain.notification.constants;

public class NotificationsConstants {
    private NotificationsConstants() {
    }

    public static final long SSE_EMITTER_DEFAULT_TIMEOUT = 3_600_000L; // 1시간
    public static final String INIT_EVENT_NAME = "INIT";
    public static final String INIT_EVENT_DATA = "connected";
    public static final String NOTIFICATION_EVENT_NAME = "notification";
    public static final String HEARTBEAT_KEY = "heartbeat:key";
    public static final String HEARTBEAT_VALUE = "ping";
    public static final long HEARTBEAT_TTL = 20L;
    public static final String SSE_HEARTBEAT_COMMENT = "heartbeat";
    public static final String NOTIFY_KEYSPACE_EVENTS_CONFIG = "notify-keyspace-events";
    public static final String EXPIRED_EVENTS_CONFIG_VALUE = "Ex";
    public static final String NOTIFICATION_CHANNEL_PREFIX = "notifications.";
    public static final String NOTIFICATION_CHANNEL_PATTERN = "notifications.*";
    public static final String HEARTBEAT_CHANNEL_PATTERN = "__keyevent@0__:expired";
}

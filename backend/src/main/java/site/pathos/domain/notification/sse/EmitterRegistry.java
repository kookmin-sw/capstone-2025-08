package site.pathos.domain.notification.sse;

import static site.pathos.domain.notification.constants.NotificationsConstants.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import site.pathos.global.security.util.SecurityUtil;

@Component
public class EmitterRegistry {
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter create() {
        Long userId = SecurityUtil.getCurrentUserId();
        SseEmitter emitter = new SseEmitter(SSE_EMITTER_DEFAULT_TIMEOUT);
        emitters.computeIfAbsent(userId, id -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError((e) -> remove(userId, emitter));

        try {
            emitter.send(
                    SseEmitter.event().name(INIT_EVENT_NAME).data(INIT_EVENT_DATA)
            );
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    public void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(userId);
        }
    }

    public void sendToUser(Long userId, String data) {
        List<SseEmitter> sseEmitters = emitters.get(userId);
        if (sseEmitters == null) {
            return;
        }
        for (SseEmitter emitter : sseEmitters) {
            try {
                emitter.send(
                        SseEmitter.event().name(NOTIFICATION_EVENT_NAME).data(data)
                );
            } catch (Exception ex) {
                emitter.completeWithError(ex);
                remove(userId, emitter);
            }
        }
    }

    public Map<Long, List<SseEmitter>> getAllSnapshot() {
        Map<Long, List<SseEmitter>> snapshot = new HashMap<>();
        emitters.forEach((userId, list) ->
                snapshot.put(userId, Collections.unmodifiableList(new ArrayList<>(list)))
        );
        return Collections.unmodifiableMap(snapshot);
    }
}
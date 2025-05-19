package site.pathos.domain.model.event;

import site.pathos.domain.user.entity.User;

public record ProjectRunCompletedEvent(
        User user,
        Long projectId,
        String projectTitle
) {
}
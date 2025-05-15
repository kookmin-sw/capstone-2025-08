package site.pathos.domain.project.event;

import site.pathos.domain.user.entity.User;

public record ProjectSvsUploadedEvent(
        User user,
        Long projectId,
        String projectTitle
) { }
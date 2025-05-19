package site.pathos.domain.sharedProject.event;

import site.pathos.domain.user.entity.User;

public record SharedProjectCommentReceivedEvent(
        User owner,
        User commenter,
        Long sharedProjectId,
        String sharedProjectTitle
) { }

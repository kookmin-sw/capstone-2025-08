package site.pathos.domain.sharedProject.event;

import site.pathos.domain.user.entity.User;

public record SharedModelCommentEvent(
        User modelOwner,
        User commenter,
        Long modelId,
        String modelName
) { }

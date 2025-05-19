package site.pathos.domain.notification.listener;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import site.pathos.domain.notification.enums.NotificationTypeCode;
import site.pathos.domain.notification.service.UserNotificationService;
import site.pathos.domain.model.event.ProjectRunCompletedEvent;
import site.pathos.domain.project.event.ProjectSvsUploadCompletedEvent;
import site.pathos.domain.model.event.ProjectTrainCompletedEvent;
import site.pathos.domain.sharedProject.event.SharedProjectCommentReceivedEvent;


@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final UserNotificationService userNotificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProjectSvsUploadCompletedEvent(ProjectSvsUploadCompletedEvent event) {
        userNotificationService.notify(
                event.user(),
                NotificationTypeCode.PROJECT_SVS_UPLOAD_COMPLETED,
                Map.of(
                        "projectId", event.projectId(),
                        "projectTitle", event.projectTitle()
                )
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProjectRunCompletedEvent(ProjectRunCompletedEvent event) {
        userNotificationService.notify(
                event.user(),
                NotificationTypeCode.PROJECT_RUN_COMPLETED,
                Map.of(
                        "projectId", event.projectId(),
                        "projectTitle", event.projectTitle()
                )
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProjectTrainCompletedEvent(ProjectTrainCompletedEvent event) {
        userNotificationService.notify(
                event.user(),
                NotificationTypeCode.PROJECT_TRAIN_COMPLETED,
                Map.of(
                        "projectId", event.projectId(),
                        "projectTitle", event.projectTitle()
                )
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSharedProjectCommentReceivedEvent(SharedProjectCommentReceivedEvent event) {
        userNotificationService.notify(
                event.owner(),
                NotificationTypeCode.SHARED_PROJECT_COMMENT_RECEIVED,
                Map.of(
                        "sharedProjectId", event.sharedProjectId(),
                        "sharedProjectTitle", event.sharedProjectTitle(),
                        "commenter", event.commenter().getName()
                )
        );
    }
}
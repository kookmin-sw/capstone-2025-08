package site.pathos.domain.notification.enums;

import lombok.Getter;

@Getter
public enum NotificationTypeCode {
    PROJECT_SVS_UPLOAD_COMPLETED("File Upload Completed"),
    PROJECT_TRAIN_COMPLETED("Model Train Completed"),
    PROJECT_RUN_COMPLETED("Model Run Completed"),
    MODEL_COMMENT_RECEIVED("New Comments");

    private final String displayName;

    NotificationTypeCode(String displayName) {
        this.displayName = displayName;
    }
}
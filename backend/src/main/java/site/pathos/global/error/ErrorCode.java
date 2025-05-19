package site.pathos.global.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    USER_NOT_FOUND(HttpStatus.BAD_REQUEST, "해당 유저를 찾을 수 없습니다."),
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 프로젝트를 찾을 수 없습니다."),
    NO_PROJECT_ACCESS(HttpStatus.FORBIDDEN, "프로젝트 접근 권한이 없습니다."),
    MODEL_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 모델을 찾을 수 없습니다."),
    SUB_PROJECT_NOT_READY(HttpStatus.BAD_REQUEST, "아직 모든 서브프로젝트의 이미지 업로드가 완료되지 않았습니다."),
    SUB_PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 서브프로젝트를 찾을 수 없습니다."),
    HEX_COLOR_INVALID(HttpStatus.BAD_REQUEST, "색상정보가 올바른 형식이 아닙니다."),
    ANNOTATION_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 서브 프로젝트에서 어노테이션 히스토리를 찾을수 없습니다."),
    MERGED_TISSUE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 ROI에서 TISSUE 어노테이션의 파일을 찾을 수 없습니다."),
    TRAINING_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 학습 기록을 찾을 수 없습니다."),
    INFERENCE_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 추론 기록을 찾을 수 없습니다."),
    PROJECT_LABEL_NOT_FUND(HttpStatus.NOT_FOUND, "해당 프로젝트 라벨을 찾을 수 없습니다"),
    PROJECT_MODEL_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 프로젝트에서 모델을 찾을 수 없습니다"),
    NOTIFICATION_TYPE_NOT_FOUND(HttpStatus.INTERNAL_SERVER_ERROR, "해당 알림 유형을 찾을 수 없습니다."),
    NOTIFICATION_SETTING_NOT_FOUND(HttpStatus.INTERNAL_SERVER_ERROR, "해당 유저의 알림 설정을 찾을 수 없습니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 알림을 찾을 수 없습니다."),
    NO_NOTIFICATION_ACCESS(HttpStatus.FORBIDDEN, "해당 알림에 접근 권한이 없습니다."),
    NO_NOTIFICATION_SETTING(HttpStatus.BAD_REQUEST, "알림 설정 값이 필요합니다.")
    ;

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.code = name();
        this.message = message;
    }

}

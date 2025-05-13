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
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
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

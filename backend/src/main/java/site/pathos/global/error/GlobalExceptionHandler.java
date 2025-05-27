package site.pathos.global.error;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ErrorResponse body = ErrorResponse.of(errorCode);
        log.warn("error={} message=\"{}\"", errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception) {
        ErrorResponse body = ErrorResponse.of(ErrorCode.INTERNAL_ERROR);
        log.error("unexpected error", exception);
        return ResponseEntity
                .internalServerError()
                .body(body);
    }
}
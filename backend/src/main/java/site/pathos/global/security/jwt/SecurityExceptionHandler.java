package site.pathos.global.security.jwt;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

@Component
public class SecurityExceptionHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final HandlerExceptionResolver resolver;

    public SecurityExceptionHandler(
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver
    ) {
        this.resolver = resolver;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) {
        resolver.resolveException(request, response, null, new BusinessException(ErrorCode.UNAUTHORIZED));
    }

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) {
        resolver.resolveException(request, response, null, new BusinessException(ErrorCode.ACCESS_DENIED));
    }
}
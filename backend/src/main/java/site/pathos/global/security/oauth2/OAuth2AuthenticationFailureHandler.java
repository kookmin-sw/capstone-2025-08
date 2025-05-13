package site.pathos.global.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final HandlerExceptionResolver resolver;

    public OAuth2AuthenticationFailureHandler(
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver
    ) {
        this.resolver = resolver;
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) {
        resolver.resolveException(request, response, null, new BusinessException(ErrorCode.UNAUTHORIZED));
    }
}
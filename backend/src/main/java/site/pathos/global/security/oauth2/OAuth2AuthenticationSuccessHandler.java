package site.pathos.global.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import site.pathos.domain.auth.service.AuthService;
import site.pathos.global.security.config.TokenProperties;
import site.pathos.global.security.constants.CookieConstants;
import site.pathos.global.security.jwt.JwtTokenDto;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final AuthService authService;
    private final TokenProperties props;
    @Value("${app.client.url.auth}")
    private String clientAuthUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        CustomOAuth2User customUser = (CustomOAuth2User) authentication.getPrincipal();
        JwtTokenDto tokens = authService.createToken(customUser.getUser());

        // RefreshToken → HttpOnly 쿠키로 설정
        ResponseCookie refreshCookie = ResponseCookie.from(CookieConstants.REFRESH_COOKIE, tokens.refreshToken())
                .httpOnly(CookieConstants.COOKIE_HTTPONLY)
                .secure(CookieConstants.COOKIE_SECURE)
                .path(CookieConstants.COOKIE_PATH)
                .sameSite(CookieConstants.SAME_SITE)
                .maxAge(props.getRefreshTokenExpirationMs())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // AccessToken → 헤더
        response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + tokens.accessToken());

        // AccessToken → 쿼리 파라미터로 프론트에 전달
        String redirectUri = UriComponentsBuilder
                .fromUriString(clientAuthUrl)
                .queryParam("token", tokens.accessToken())
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUri);
    }
}
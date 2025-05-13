package site.pathos.global.security.logout;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import site.pathos.domain.auth.service.AuthService;
import site.pathos.global.security.constants.CookieConstants;

@RequiredArgsConstructor
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {
    private final AuthService authService;

    @Override
    public void onLogoutSuccess(HttpServletRequest request,
                                HttpServletResponse response,
                                Authentication authentication) {
        // RefreshToken 삭제 로직
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (CookieConstants.REFRESH_COOKIE.equals(c.getName())) {
                    authService.logout(c.getValue());
                    break;
                }
            }
        }

        // 쿠키 클리어
        ResponseCookie clear = ResponseCookie.from(CookieConstants.REFRESH_COOKIE, "")
                .httpOnly(CookieConstants.COOKIE_HTTPONLY)
                .secure(CookieConstants.COOKIE_SECURE)
                .path(CookieConstants.COOKIE_PATH)
                .sameSite(CookieConstants.SAME_SITE)
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, clear.toString());
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
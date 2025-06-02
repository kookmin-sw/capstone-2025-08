package site.pathos.domain.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.auth.service.AuthService;
import site.pathos.global.security.config.TokenProperties;
import site.pathos.global.security.constants.CookieConstants;
import site.pathos.global.security.jwt.JwtTokenDto;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final TokenProperties props;

    @Operation(summary = "액세스 토큰 만료 시 호출하여 새로운 액세스 토큰 및 리프레시 토큰을 발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<JwtTokenDto> refresh(
            @CookieValue(value = CookieConstants.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        // 리프레시 토큰이 없는 요청은 401 응답
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        JwtTokenDto tokens = authService.refreshTokens(refreshToken);

        // Refresh 토큰 쿠키로 재설정
        ResponseCookie refreshCookie = ResponseCookie.from(CookieConstants.REFRESH_COOKIE, tokens.refreshToken())
                .httpOnly(true)
                .secure(true)
                .path(CookieConstants.COOKIE_PATH)
                .maxAge(props.getRefreshTokenExpirationMs())
                .sameSite(CookieConstants.SAME_SITE)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 새 AccessToken 은 Authorization 헤더로
        response.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + tokens.accessToken());

        return ResponseEntity.ok(tokens);
    }
}

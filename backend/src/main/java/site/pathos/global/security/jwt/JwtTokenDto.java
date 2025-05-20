package site.pathos.global.security.jwt;

public record JwtTokenDto(
        String accessToken,
        String refreshToken
) {
}
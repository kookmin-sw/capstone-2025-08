package site.pathos.global.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import site.pathos.domain.user.entity.User;
import site.pathos.domain.user.repository.UserRepository;
import site.pathos.global.error.BusinessException;
import site.pathos.global.error.ErrorCode;
import site.pathos.global.security.config.TokenProperties;
import site.pathos.global.security.oauth2.CustomOAuth2User;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    private final UserRepository userRepository;
    private final TokenProperties tokenProps;
    private Key key;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(tokenProps.getSecretKey());
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .setClaims(getClaims(user))
                .setIssuedAt(now)
                .setExpiration(new Date(System.currentTimeMillis() + tokenProps.getAccessTokenExpirationMs()))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .setClaims(getClaims(user))
                .setIssuedAt(now)
                .setExpiration(new Date(System.currentTimeMillis() + tokenProps.getRefreshTokenExpirationMs()))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims getClaims(User user) {
        Claims claims = Jwts.claims().setSubject(user.getId().toString());
        claims.put("roles", List.of(user.getRole().name()));
        return claims;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Long userId = Long.parseLong(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        CustomOAuth2User principal = new CustomOAuth2User(user);

        return new UsernamePasswordAuthenticationToken(
                principal,
                token,
                principal.getAuthorities()
        );
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.valueOf(claims.getSubject());
    }
}
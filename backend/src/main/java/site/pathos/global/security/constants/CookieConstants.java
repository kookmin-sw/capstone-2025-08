package site.pathos.global.security.constants;

public final class CookieConstants {
    private CookieConstants() {
    }

    public static final String REFRESH_COOKIE = "REFRESH_TOKEN";
    public static final String COOKIE_PATH = "/";
    public static final String SAME_SITE = "Strict";
    public static final boolean COOKIE_SECURE = true;
    public static final boolean COOKIE_HTTPONLY = true;
}

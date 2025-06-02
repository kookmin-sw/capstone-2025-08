package site.pathos.global.security.oauth2.userinfo;

import java.util.Map;

public class GoogleUserInfo {
    private final Map<String, Object> attributes;

    public GoogleUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public String getId() {
        return (String) attributes.get("sub");
    }

    public String getEmail() {
        return (String) attributes.get("email");
    }

    public String getName() {
        return (String) attributes.getOrDefault("name", "Unknown");
    }

    public String getPicture() {
        return (String) attributes.getOrDefault("picture", "");
    }
}
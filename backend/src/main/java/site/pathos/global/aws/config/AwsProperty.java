package site.pathos.global.aws.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import software.amazon.awssdk.regions.Region;

@ConfigurationProperties(prefix = "cloud.aws")
public record AwsProperty(
        @NotBlank String region,
        Credentials credentials,
        S3 s3
) {
    public record Credentials(@NotBlank String accessKey, @NotBlank String secretKey) {}
    public record S3(@NotBlank String bucket) {}

    public Region regionAsEnum() {
        return Region.of(region); // Region.of는 유효한 region 문자열만 허용
    }
}
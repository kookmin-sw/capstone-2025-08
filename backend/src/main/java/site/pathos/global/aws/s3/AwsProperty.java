package site.pathos.global.aws.s3;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cloud.aws")
public record AwsProperty(
        @NotBlank String region,
        Credentials credentials,
        S3 s3
) {
    public record Credentials(@NotBlank String accessKey, @NotBlank String secretKey) {}
    public record S3(@NotBlank String bucket) {}
}
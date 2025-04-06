package site.pathos.global.aws.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.internal.crt.S3CrtAsyncClient;

@Configuration
@RequiredArgsConstructor
public class AmazonS3Configuration {

    private final AwsProperty awsProperty;

    @Bean
    public S3AsyncClient amazonS3Client() {
        AwsBasicCredentials creds = AwsBasicCredentials.create(
                awsProperty.credentials().accessKey(),
                awsProperty.credentials().secretKey());
        return S3CrtAsyncClient.builder()
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .region(resolveRegion(awsProperty.region()))
                .build();
    }

    private Region resolveRegion(String regionStr) {
        return Region.regions().stream()
                .filter(r -> r.id().equals(regionStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid AWS region: " + regionStr));
    }

}

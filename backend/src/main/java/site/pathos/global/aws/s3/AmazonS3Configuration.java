package site.pathos.global.aws.s3;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.internal.crt.S3CrtAsyncClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class AmazonS3Configuration {

    private final AwsProperty awsProperty;

    public AmazonS3Configuration(AwsProperty awsProperty) {
        this.awsProperty = awsProperty;
    }

    @Bean
    public StaticCredentialsProvider awsCredentialsProvider() {
        AwsBasicCredentials creds = AwsBasicCredentials.create(
                awsProperty.credentials().accessKey(),
                awsProperty.credentials().secretKey()
        );
        return StaticCredentialsProvider.create(creds);
    }

    @Bean
    public Region awsRegion() {
        String regionStr = awsProperty.region();
        return Region.regions().stream()
                .filter(r -> r.id().equals(regionStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid AWS region: " + regionStr));
    }

    @Bean
    public S3AsyncClient amazonS3Client(
            StaticCredentialsProvider awsCredentialsProvider,
            Region awsRegion
    ) {
        return S3CrtAsyncClient.builder()
                .credentialsProvider(awsCredentialsProvider)
                .region(awsRegion)
                .build();
    }

    @Bean
    public S3Presigner s3Presigner(
            StaticCredentialsProvider awsCredentialsProvider,
            Region awsRegion
    ) {
        return S3Presigner.builder()
                .credentialsProvider(awsCredentialsProvider)
                .region(awsRegion)
                .build();
    }
}
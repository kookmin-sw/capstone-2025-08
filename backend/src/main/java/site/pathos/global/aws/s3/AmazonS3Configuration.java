package site.pathos.global.aws.s3;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import site.pathos.global.aws.config.AwsProperty;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.internal.crt.S3CrtAsyncClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class AmazonS3Configuration {

    private final AwsProperty awsProperty;

    public AmazonS3Configuration(AwsProperty awsProperty) {
        this.awsProperty = awsProperty;
    }

    @Bean
    public S3AsyncClient S3ClientAsync(
            StaticCredentialsProvider awsCredentialsProvider
    ) {
        return S3CrtAsyncClient.builder()
                .credentialsProvider(awsCredentialsProvider)
                .region(awsProperty.regionAsEnum())
                .build();
    }

    @Bean
    public S3Client s3Client(StaticCredentialsProvider awsCredentialsProvider) {
        return S3Client.builder()
                .region(awsProperty.regionAsEnum())
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }

    @Bean
    public S3Presigner s3Presigner(
            StaticCredentialsProvider awsCredentialsProvider
    ) {
        return S3Presigner.builder()
                .credentialsProvider(awsCredentialsProvider)
                .region(awsProperty.regionAsEnum())
                .build();
    }
}
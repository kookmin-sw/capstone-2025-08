package site.pathos.global.aws.sqs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import site.pathos.global.aws.config.AwsProperty;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.services.sqs.SqsClient;

@Configuration
public class SqsConfig {

    private final AwsProperty awsProperty;

    public SqsConfig(AwsProperty awsProperty){
        this.awsProperty = awsProperty;
    }

    @Bean
    public SqsClient sqsClient(StaticCredentialsProvider awsCredentialsProvider) {
        return SqsClient.builder()
                .region(awsProperty.regionAsEnum()) // 서울 리전
                .credentialsProvider(awsCredentialsProvider) // 기본 AWS 자격증명 사용
                .build();
    }
}

package site.pathos.global.aws.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.services.ec2.Ec2Client;

@Configuration
public class AwsClientConfig {

    private final AwsProperty awsProperty;
    private final StaticCredentialsProvider awsCredentialsProvider;

    public AwsClientConfig(AwsProperty awsProperty, StaticCredentialsProvider awsCredentialsProvider) {
        this.awsProperty = awsProperty;
        this.awsCredentialsProvider = awsCredentialsProvider;
    }

    @Bean
    public Ec2Client ec2Client() {
        return Ec2Client.builder()
                .region(awsProperty.regionAsEnum())
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }
}

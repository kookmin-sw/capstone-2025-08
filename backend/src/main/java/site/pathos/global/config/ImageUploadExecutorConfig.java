package site.pathos.global.config;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ImageUploadExecutorConfig {

    @Bean(name = "imageUploadExecutor")
    public ExecutorService imageUploadExecutor() {
        return Executors.newFixedThreadPool(8);
    }
}

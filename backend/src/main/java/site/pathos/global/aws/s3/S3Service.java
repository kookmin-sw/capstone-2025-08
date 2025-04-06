package site.pathos.global.aws.s3;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3AsyncClient amazonS3Client;

    private final AwsProperty awsProperty;

    public void uploadFile(String key, MultipartFile file) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(awsProperty.region())
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            CompletableFuture<Void> future = amazonS3Client.putObject(
                    request,
                    AsyncRequestBody.fromInputStream(file.getInputStream(), file.getSize(), Executors.newSingleThreadExecutor())
            ).thenAccept(response -> {
                log.info("파일 업로드 완료: {}", key);
            }).exceptionally(ex -> {
                log.error("업로드 실패: {}", ex.getMessage(), ex);
                return null;
            });

            future.join();

        } catch (Exception e) {
            log.error("업로드 중 예외 발생", e);
            throw new RuntimeException(e);
        }
    }
}

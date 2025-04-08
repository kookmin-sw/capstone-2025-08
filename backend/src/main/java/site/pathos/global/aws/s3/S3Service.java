package site.pathos.global.aws.s3;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.global.aws.config.AwsProperty;
import site.pathos.global.util.ImageUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3Client s3Client;
    private final AwsProperty awsProperty;
    private final S3Presigner s3Presigner;

    public void uploadFile(String key, MultipartFile file) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(awsProperty.s3().bucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );

            log.info("S3 업로드 완료: {}", key);
        } catch (IOException e) {
            log.error("S3 업로드 중 오류 발생", e);
            throw new RuntimeException("S3 업로드 실패", e);
        }
    }

    public String uploadBufferedImage(BufferedImage image, String filename) {
        byte[] imageBytes = ImageUtils.convertToByteArray(image);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(awsProperty.s3().bucket()) // bucket 이름 가져오기
                .key(filename)
                .contentType("image/png")
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(imageBytes));

        return filename;
    }

    public String getPresignedUrl(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(awsProperty.s3().bucket())
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .getObjectRequest(getObjectRequest)
                .signatureDuration(Duration.ofMinutes(10))
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
}

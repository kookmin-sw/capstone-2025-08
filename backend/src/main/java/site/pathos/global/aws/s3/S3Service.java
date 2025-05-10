package site.pathos.global.aws.s3;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import site.pathos.domain.subProject.dto.request.SubProjectTilingRequestDto;
import site.pathos.global.aws.config.AwsProperty;
import site.pathos.global.aws.s3.dto.S3UploadFileDto;
import site.pathos.global.util.image.ImageUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CompletedMultipartUpload;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.UploadPartRequest;
import software.amazon.awssdk.services.s3.model.UploadPartResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3Client s3Client;
    private final AwsProperty awsProperty;
    private final S3Presigner s3Presigner;
    private final ExecutorService imageUploadExecutor;

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
            log.error("S3 업로드 중 오류 발생: key = {}", key, e);
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

    public InputStream downloadFile(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(awsProperty.s3().bucket())
                .key(key)
                .build();

        return s3Client.getObject(getObjectRequest);
    }

    public BufferedImage downloadBufferedImage(String key) {
        try (InputStream inputStream = downloadFile(key)) {
            return ImageIO.read(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("S3 이미지 다운로드 실패: " + key, e);
        }
    }

    public void uploadFilesAsync(List<S3UploadFileDto> files, Consumer<List<SubProjectTilingRequestDto>> onComplete) {
        List<CompletableFuture<Void>> uploadTasks = files.stream()
                .map(s3UploadFile -> CompletableFuture.runAsync(() -> {
                    uploadFile(s3UploadFile.key(), s3UploadFile.file());
                }, imageUploadExecutor))
                .toList();

        CompletableFuture.allOf(uploadTasks.toArray(new CompletableFuture[0]))
                .thenRun(() -> {
                    log.info("모든 파일 업로드 완료");

                    List<SubProjectTilingRequestDto> uploadImages = files.stream()
                            .map(file -> new SubProjectTilingRequestDto(
                                    file.subProjectId(),
                                    "s3://" + awsProperty.s3().bucket() + "/" + file.key()))
                            .toList();

                    onComplete.accept(uploadImages);
                })
                .exceptionally(ex -> {
                    log.error("일부 파일 업로드 실패", ex);
                    return null;
                });
    }

    public void uploadFileAsMultipart(String key, MultipartFile file) {
        String bucket = awsProperty.s3().bucket();
        long partSize = 5 * 1024 * 1024; // 5MB

        try (InputStream inputStream = file.getInputStream()) {
            CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            CreateMultipartUploadResponse createResp = s3Client.createMultipartUpload(createRequest);
            String uploadId = createResp.uploadId();

            List<CompletedPart> completedParts = Collections.synchronizedList(new ArrayList<>());
            ExecutorService executor = Executors.newFixedThreadPool(4);
            List<CompletableFuture<Void>> futures = new ArrayList<>();

            byte[] buffer = new byte[(int) partSize];
            int bytesRead;
            int partNumber = 1;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                final int currentPartNumber = partNumber++;
                final byte[] partData = Arrays.copyOf(buffer, bytesRead);

                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    try {
                        UploadPartRequest uploadRequest = UploadPartRequest.builder()
                                .bucket(bucket)
                                .key(key)
                                .uploadId(uploadId)
                                .partNumber(currentPartNumber)
                                .contentLength((long) partData.length)
                                .build();

                        RequestBody requestBody = RequestBody.fromBytes(partData);
                        UploadPartResponse response = s3Client.uploadPart(uploadRequest, requestBody);

                        completedParts.add(CompletedPart.builder()
                                .partNumber(currentPartNumber)
                                .eTag(response.eTag())
                                .build());

                    } catch (Exception e) {
                        throw new CompletionException(e);
                    }
                }, executor);

                futures.add(future);
            }

            // 모든 파트 업로드 완료 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            completedParts.sort(Comparator.comparingInt(CompletedPart::partNumber));

            // 업로드 완료
            CompleteMultipartUploadRequest completeRequest = CompleteMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .uploadId(uploadId)
                    .multipartUpload(CompletedMultipartUpload.builder()
                            .parts(new ArrayList<>(completedParts))
                            .build())
                    .build();

            s3Client.completeMultipartUpload(completeRequest);
            log.info("S3 업로드 완료: {}", key);

        } catch (Exception e) {
            log.error("업로드 중 오류 발생: {}", key, e);
            throw new RuntimeException("업로드 실패", e);
        }
    }
}

package site.pathos.global.aws.s3.dto;

import org.springframework.web.multipart.MultipartFile;

public record S3UploadFileDto(
        String key,
        MultipartFile file
) {
}

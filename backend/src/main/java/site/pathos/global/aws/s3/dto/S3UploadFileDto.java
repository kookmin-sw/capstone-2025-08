package site.pathos.global.aws.s3.dto;

import org.springframework.web.multipart.MultipartFile;

public record S3UploadFileDto(
        Long subProjectId,
        String key,
        MultipartFile file
) {
}

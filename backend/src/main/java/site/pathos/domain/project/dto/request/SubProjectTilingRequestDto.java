package site.pathos.domain.project.dto.request;

public record SubProjectTilingRequestDto(
        Long subProjectId,
        String s3Path
) {
}

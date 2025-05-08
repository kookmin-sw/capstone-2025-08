package site.pathos.domain.subProject.dto.request;

public record SubProjectTilingRequestDto(
        Long subProjectId,
        String s3Path
) {
}

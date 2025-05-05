package site.pathos.domain.roi.dto.response;

public record RoiResponseDto(
        Long id,
        int x,
        int y,
        int width,
        int height
) {}
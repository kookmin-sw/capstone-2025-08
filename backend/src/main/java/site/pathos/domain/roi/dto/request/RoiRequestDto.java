package site.pathos.domain.roi.dto.request;

public record RoiRequestDto(
        int x,
        int y,
        int width,
        int height
) {
}

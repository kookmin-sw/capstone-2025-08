package site.pathos.domain.project.dto.request;

public record CreateProjectRequestDto(
    String title,
    String description,
    Long modelId
) {
}

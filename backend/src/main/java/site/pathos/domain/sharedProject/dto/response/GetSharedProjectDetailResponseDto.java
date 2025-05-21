package site.pathos.domain.sharedProject.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record GetSharedProjectDetailResponseDto (
        Long sharedProjectId,
        String title,
        String description,
        LocalDateTime createdAt,
        String authorName,
        ModelInfo model,
        List<String> tags,
        List<String> originalImagePaths,
        List<String> resultImagePaths
) {
    public record ModelInfo(
            Long modelId,
            String modelName
    ) {
    }
}

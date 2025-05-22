package site.pathos.domain.sharedProject.dto.request;

import java.util.List;

public record CreateSharedProjectDto(
        Long projectId,

        Long modelId,

        String title,

        String description,

        List<String> tags

) {
}

package site.pathos.domain.sharedProject.dto.response;

import site.pathos.global.common.PaginationResponse;

import java.util.List;

public record GetSharedProjectsResponseDto(
        PaginationResponse<GetSharedProjectsResponseDetailDto> sharedProject,
        List<BestProjectDto> bestProjects
) {
    public record GetSharedProjectsResponseDetailDto(
            Long sharedProjectId,

            String title,

            String authorName,

            String thumbnailUrl,

            List<String> tags,

            long downloadCount
    ){}
    public record BestProjectDto(
            Long sharedProjectId,
            String title,
            String authorName,
            String profileImageUrl,
            long downloadCount
    ){}
}

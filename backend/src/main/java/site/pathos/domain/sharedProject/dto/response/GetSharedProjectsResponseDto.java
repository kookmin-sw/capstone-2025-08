package site.pathos.domain.sharedProject.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import site.pathos.global.common.PaginationResponse;

import java.util.List;

@Schema(description = "공유 프로젝트 리스트 및 베스트 프로젝트 응답 DTO")
public record GetSharedProjectsResponseDto(

        @Schema(description = "페이지네이션된 공유 프로젝트 목록")
        PaginationResponse<GetSharedProjectsResponseDetailDto> sharedProject,

        @Schema(description = "베스트 공유 프로젝트 목록")
        List<BestProjectDto> bestProjects

) {

    @Schema(description = "공유 프로젝트 상세 정보 DTO")
    public record GetSharedProjectsResponseDetailDto(

            @Schema(description = "공유 프로젝트 ID", example = "1")
            Long sharedProjectId,

            @Schema(description = "공유 프로젝트 제목", example = "세포 분류 AI 프로젝트")
            String title,

            @Schema(description = "작성자 이름", example = "홍길동")
            String authorName,

            @Schema(description = "썸네일 이미지 URL", example = "https://example.com/images/thumb.jpg")
            String thumbnailUrl,

            @Schema(description = "태그 목록", example = "[\"Cell\", \"DataSet\"]")
            List<String> tags,

            @Schema(description = "다운로드 횟수", example = "1234")
            long downloadCount

    ) {}

    @Schema(description = "베스트 공유 프로젝트 정보 DTO")
    public record BestProjectDto(

            @Schema(description = "공유 프로젝트 ID", example = "2")
            Long sharedProjectId,

            @Schema(description = "공유 프로젝트 제목", example = "최고의 병리 모델")
            String title,

            @Schema(description = "작성자 이름", example = "김의사")
            String authorName,

            @Schema(description = "프로필 이미지 URL", example = "https://example.com/profiles/profile1.jpg")
            String profileImageUrl,

            @Schema(description = "다운로드 횟수", example = "1023")
            long downloadCount

    ) {}
}
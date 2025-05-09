package site.pathos.domain.project.dto.response;

import site.pathos.domain.subProject.dto.response.SubProjectSummaryDto;

import java.util.List;

public record GetSubProjectResponseDto(
        Long projectId,
        String title,
        List<SubProjectSummaryDto> subProjects
) {
}

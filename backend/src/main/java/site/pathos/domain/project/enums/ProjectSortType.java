package site.pathos.domain.project.enums;

import lombok.Getter;
import org.springframework.data.domain.Sort;

@Getter
public enum ProjectSortType {
    CREATED_AT_ASC(Sort.by(Sort.Direction.ASC, "createdAt")),
    CREATED_AT_DESC(Sort.by(Sort.Direction.DESC, "createdAt")),
    UPDATED_AT_ASC(Sort.by(Sort.Direction.ASC, "updatedAt")),
    UPDATED_AT_DESC(Sort.by(Sort.Direction.DESC, "updatedAt"));

    private final Sort sort;
    public static final String DEFAULT_SORT = "UPDATED_AT_DESC";

    ProjectSortType(Sort sort) {
        this.sort = sort;
    }
}
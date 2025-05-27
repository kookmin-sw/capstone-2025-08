package site.pathos.domain.project.enums;

import lombok.Getter;
import org.springframework.data.domain.Sort;

@Getter
public enum ProjectSortType {
    CREATED_AT_ASC("Created (asc)", Sort.by(Sort.Direction.ASC, "createdAt")),
    CREATED_AT_DESC("Created (desc)", Sort.by(Sort.Direction.DESC, "createdAt")),
    UPDATED_AT_ASC("Edited (asc)", Sort.by(Sort.Direction.ASC, "updatedAt")),
    UPDATED_AT_DESC("Edited (desc)", Sort.by(Sort.Direction.DESC, "updatedAt"));

    private final String displayName;
    private final Sort sort;
    public static final String DEFAULT_SORT = "Edited (desc)";

    ProjectSortType(String displayName, Sort sort) {
        this.displayName = displayName;
        this.sort = sort;
    }

    public static ProjectSortType getByDisplayName(String displayName) {
        for (ProjectSortType projectSortType : ProjectSortType.values()) {
            if (projectSortType.displayName.equals(displayName)) {
                return projectSortType;
            }
        }
        throw new IllegalArgumentException("not found project sort type");
    }
}
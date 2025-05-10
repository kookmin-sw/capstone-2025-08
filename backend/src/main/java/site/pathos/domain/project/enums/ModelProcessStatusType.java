package site.pathos.domain.project.enums;

import lombok.Getter;

@Getter
public enum ModelProcessStatusType {
    PROGRESS("Progress"),
    ;

    private final String name;

    ModelProcessStatusType(String name) {
        this.name = name;
    }
}

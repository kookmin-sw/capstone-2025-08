package site.pathos.domain.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.model.enums.MetricType;
import site.pathos.domain.project.entity.Project;

@Entity
@Table(name = "project_metric")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;

    @Column(name = "score", nullable = false)
    private Double score;

    @Builder
    public ProjectMetric(Project project, MetricType metricType, Double score) {
        this.project = project;
        this.metricType = metricType;
        this.score = score;
    }
}

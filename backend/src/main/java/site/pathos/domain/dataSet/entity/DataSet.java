package site.pathos.domain.dataSet.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.sharedProject.entity.SharedProject;

@Entity
@Table(name = "data_set")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DataSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_project_id", nullable = false)
    private SharedProject sharedProject;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "data_type", nullable = false)
    private DataType dataType;
}

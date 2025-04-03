package site.pathos.domain.userModel.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import site.pathos.domain.model.entitiy.Model;
import site.pathos.domain.user.entity.User;

@Entity
@Table(name = "user_model")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;
}

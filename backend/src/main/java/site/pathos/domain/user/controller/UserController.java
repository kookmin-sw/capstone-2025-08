package site.pathos.domain.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.pathos.domain.user.dto.GetMyPageResponseDto;
import site.pathos.domain.user.dto.UpdateUserRequestDto;
import site.pathos.domain.user.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<GetMyPageResponseDto> getMyPage() {
        return ResponseEntity.ok(
                userService.getMyPage()
        );
    }

    @PatchMapping("/me")
    public ResponseEntity<Void> updateUser(
            @RequestBody UpdateUserRequestDto request
    ) {
        userService.updateUser(request);
        return ResponseEntity.noContent().build();
    }
}
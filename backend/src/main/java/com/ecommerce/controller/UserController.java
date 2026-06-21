package com.ecommerce.controller;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.UpdateNameRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateName(Authentication auth, @Valid @RequestBody UpdateNameRequest request) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setName(request.getName());
        userRepository.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}

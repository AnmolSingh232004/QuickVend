package com.ecommerce.service;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.entity.User;
import com.ecommerce.entity.enums.Role;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldSucceed_WhenEmailNotTaken() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(jwtTokenProvider.generateToken(anyString(), anyString())).thenReturn("mockToken");

        User savedUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.ROLE_CUSTOMER)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getName());
        assertEquals("ROLE_CUSTOMER", response.getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("encodedPassword", userCaptor.getValue().getPassword());
        assertEquals(Role.ROLE_CUSTOMER, userCaptor.getValue().getRole());
    }

    @Test
    void register_ShouldThrow_WhenEmailAlreadyTaken() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("taken@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_ShouldSucceed_WithValidCredentials() {
        User user = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.ROLE_CUSTOMER)
                .build();

        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken("test@example.com", "ROLE_CUSTOMER")).thenReturn("mockToken");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getName());
        assertEquals("ROLE_CUSTOMER", response.getRole());
    }

    @Test
    void login_ShouldThrow_WhenEmailNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    void login_ShouldThrow_WhenPasswordWrong() {
        User user = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.ROLE_CUSTOMER)
                .build();

        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}

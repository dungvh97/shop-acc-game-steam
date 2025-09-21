package com.shopaccgame.controller;

import com.shopaccgame.dto.AuthRequest;
import com.shopaccgame.dto.AuthResponse;
import com.shopaccgame.dto.OAuthRequest;
import com.shopaccgame.dto.UserDto;
import com.shopaccgame.dto.EmailVerificationRequest;
import com.shopaccgame.dto.SendVerificationRequest;
import com.shopaccgame.entity.User;
import com.shopaccgame.repository.UserRepository;
import com.shopaccgame.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/oauth/login")
    public ResponseEntity<AuthResponse> oauthLogin(@Valid @RequestBody OAuthRequest request) {
        AuthResponse response = authService.oauthLogin(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody User user) {
        UserDto response = authService.register(user);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(@Valid @RequestBody SendVerificationRequest request) {
        try {
            authService.sendVerificationCode(request);
            return ResponseEntity.ok().body(Map.of("message", "Verification code sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        try {
            boolean verified = authService.verifyEmail(request);
            return ResponseEntity.ok().body(Map.of("verified", verified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String testEmail = request.get("email");
            if (testEmail == null || testEmail.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            // Send a test email
            authService.sendVerificationCode(new SendVerificationRequest() {{
                setEmail(testEmail);
            }});
            
            return ResponseEntity.ok().body(Map.of("message", "Test email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new UserDto(currentUser));
    }
    
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdminUser(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            
            if (username == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username, email, and password are required"));
            }
            
            // Check if user already exists
            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }
            
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }
            
            // Create admin user
            User adminUser = new User();
            adminUser.setUsername(username);
            adminUser.setEmail(email);
            adminUser.setPassword(passwordEncoder.encode(password));
            adminUser.setRole(User.Role.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setEmailVerified(true);
            
            User savedUser = userRepository.save(adminUser);
            
            return ResponseEntity.ok(Map.of(
                "message", "Admin user created successfully",
                "user", new UserDto(savedUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

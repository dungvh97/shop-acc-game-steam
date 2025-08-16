package com.shopaccgame.service;

import com.shopaccgame.dto.AuthRequest;
import com.shopaccgame.dto.AuthResponse;
import com.shopaccgame.dto.OAuthRequest;
import com.shopaccgame.dto.UserDto;
import com.shopaccgame.dto.EmailVerificationRequest;
import com.shopaccgame.dto.SendVerificationRequest;
import com.shopaccgame.entity.User;
import com.shopaccgame.entity.EmailVerification;
import com.shopaccgame.repository.UserRepository;
import com.shopaccgame.repository.EmailVerificationRepository;
import com.shopaccgame.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Random;

@Service
public class AuthService implements UserDetailsService {
    
    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthService(UserRepository userRepository, 
                      EmailVerificationRepository emailVerificationRepository,
                      EmailService emailService,
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    public AuthResponse login(AuthRequest request) {
        // Find user and validate password manually
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        final UserDetails userDetails = loadUserByUsername(request.getUsername());
        final String token = jwtUtil.generateToken(userDetails);
        
        return new AuthResponse(token, new UserDto(user));
    }
    
    public AuthResponse oauthLogin(OAuthRequest request) {
        User.OAuthProvider provider = User.OAuthProvider.valueOf(request.getProvider().toUpperCase());
        
        // Check if user exists with this OAuth ID
        User user = userRepository.findByOauthProviderAndOauthId(provider, request.getOauthId())
            .orElseGet(() -> {
                // Check if user exists with this email
                return userRepository.findByEmail(request.getEmail())
                    .orElseGet(() -> {
                        // Create new user
                        User newUser = new User();
                        newUser.setEmail(request.getEmail());
                        newUser.setFirstName(request.getFirstName());
                        newUser.setLastName(request.getLastName());
                        newUser.setUsername(generateUsername(request.getEmail()));
                        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                        newUser.setOauthProvider(provider);
                        newUser.setOauthId(request.getOauthId());
                        newUser.setProfilePicture(request.getProfilePicture());
                        newUser.setEmailVerified(true);
                        newUser.setRole(User.Role.USER);
                        newUser.setEnabled(true);
                        return userRepository.save(newUser);
                    });
            });
        
        final UserDetails userDetails = loadUserByUsername(user.getUsername());
        final String token = jwtUtil.generateToken(userDetails);
        
        return new AuthResponse(token, new UserDto(user));
    }
    
    public UserDto register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Validate email format
        if (!isValidEmail(user.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setOauthProvider(User.OAuthProvider.LOCAL);
        user.setEmailVerified(false);
        User savedUser = userRepository.save(user);
        return new UserDto(savedUser);
    }
    
    public void sendVerificationCode(SendVerificationRequest request) {
        // Validate email format
        if (!isValidEmail(request.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Generate verification code
        String verificationCode = generateVerificationCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        
        // Save verification code
        EmailVerification emailVerification = new EmailVerification(
            request.getEmail(), verificationCode, expiresAt);
        emailVerificationRepository.save(emailVerification);
        
        // Send email
        emailService.sendVerificationEmail(request.getEmail(), verificationCode);
    }
    
    public boolean verifyEmail(EmailVerificationRequest request) {
        LocalDateTime now = LocalDateTime.now();
        
        EmailVerification verification = emailVerificationRepository
            .findByEmailAndVerificationCodeAndIsUsedFalseAndExpiresAtAfter(
                request.getEmail(), request.getVerificationCode(), now)
            .orElseThrow(() -> new RuntimeException("Invalid or expired verification code"));
        
        // Mark as used
        verification.setUsed(true);
        emailVerificationRepository.save(verification);
        
        return true;
    }
    
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        // Basic email validation regex
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
    
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit code
        return String.valueOf(code);
    }
    
    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user;
    }
}

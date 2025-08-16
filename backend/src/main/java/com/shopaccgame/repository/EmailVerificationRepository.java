package com.shopaccgame.repository;

import com.shopaccgame.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    
    Optional<EmailVerification> findByEmailAndVerificationCodeAndIsUsedFalseAndExpiresAtAfter(
        String email, String verificationCode, LocalDateTime now);
    
    void deleteByEmailAndIsUsedTrue(String email);
    
    void deleteByExpiresAtBefore(LocalDateTime now);
}

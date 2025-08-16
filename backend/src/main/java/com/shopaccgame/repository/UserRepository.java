package com.shopaccgame.repository;

import com.shopaccgame.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByOauthProviderAndOauthId(User.OAuthProvider provider, String oauthId);
    
    Optional<User> findByEmailAndOauthProvider(String email, User.OAuthProvider provider);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByOauthProviderAndOauthId(User.OAuthProvider provider, String oauthId);
}

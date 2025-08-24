package com.shopaccgame.repository;

import com.shopaccgame.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    
    // Find by name (case insensitive)
    List<Game> findByNameContainingIgnoreCase(String name);
    
    // Find by name with pagination (case insensitive)
    Page<Game> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Find by description (case insensitive)
    List<Game> findByDescriptionContainingIgnoreCase(String description);
    
    // Find by description with pagination (case insensitive)
    Page<Game> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);
}

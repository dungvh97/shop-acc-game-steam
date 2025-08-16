package com.shopaccgame.repository;

import com.shopaccgame.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    
    // Find by RAWG ID
    Optional<Game> findByRawgId(Long rawgId);
    
    // Find by ID with steam accounts
    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN FETCH g.steamAccounts WHERE g.id = :id")
    Optional<Game> findByIdWithSteamAccounts(@Param("id") Long id);
    
    // Check if exists by RAWG ID
    boolean existsByRawgId(Long rawgId);
    
    // Find active games with steam accounts
    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN FETCH g.steamAccounts WHERE g.active = true ORDER BY g.id")
    List<Game> findByActiveTrueWithSteamAccounts();
    
    // Find active games with pagination - optimized with index hint
    @Query("SELECT g FROM Game g WHERE g.active = true ORDER BY g.id")
    Page<Game> findByActiveTrue(Pageable pageable);
    
    // Find active games with steam accounts for pagination (using separate query)
    @Query("SELECT g.id FROM Game g WHERE g.active = true ORDER BY g.id")
    Page<Long> findActiveGameIds(Pageable pageable);
    
    // Find featured games with steam accounts for pagination
    @Query("SELECT g.id FROM Game g WHERE g.featured = true AND g.active = true ORDER BY g.id")
    Page<Long> findFeaturedGameIds(Pageable pageable);
    
    // Find games by category with steam accounts for pagination
    @Query("SELECT g.id FROM Game g WHERE g.category = :category AND g.active = true ORDER BY g.id")
    Page<Long> findGameIdsByCategory(@Param("category") Game.Category category, Pageable pageable);
    
    // Find games by search term with steam accounts for pagination
    @Query("SELECT g.id FROM Game g WHERE g.active = true AND " +
           "(LOWER(g.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(g.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY g.id")
    Page<Long> findGameIdsBySearch(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find featured games with steam accounts
    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN FETCH g.steamAccounts WHERE g.featured = true AND g.active = true ORDER BY g.id")
    List<Game> findByFeaturedTrueAndActiveTrueWithSteamAccounts();
    
    // Find by category with steam accounts
    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN FETCH g.steamAccounts WHERE g.category = :category AND g.active = true ORDER BY g.id")
    List<Game> findByCategoryAndActiveTrueWithSteamAccounts(@Param("category") Game.Category category);
    
    // Find by type with steam accounts
    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN FETCH g.steamAccounts WHERE g.type = :type AND g.active = true ORDER BY g.id")
    List<Game> findByTypeAndActiveTrueWithSteamAccounts(@Param("type") Game.Type type);
    
    // Search by name (case insensitive) with steam accounts - optimized
    @Query("SELECT DISTINCT g FROM Game g LEFT JOIN FETCH g.steamAccounts WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND g.active = true ORDER BY g.id")
    List<Game> searchByNameWithSteamAccounts(@Param("searchTerm") String searchTerm);
    
    // Legacy methods for backward compatibility
    List<Game> findByActiveTrue();
    List<Game> findByFeaturedTrueAndActiveTrue();
    List<Game> findByCategoryAndActiveTrue(Game.Category category);
    List<Game> findByTypeAndActiveTrue(Game.Type type);
    List<Game> searchByName(@Param("searchTerm") String searchTerm);
    
    // Price-related queries removed - prices are now calculated from SteamAccount relationships
    
    // Find by rating
    List<Game> findByRatingGreaterThanEqualAndActiveTrue(Double rating);
    
    // Paginated search - optimized
    @Query("SELECT g FROM Game g WHERE g.active = true AND " +
           "(LOWER(g.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(g.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY g.id")
    Page<Game> searchGames(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find by category with pagination - optimized
    @Query("SELECT g FROM Game g WHERE g.category = :category AND g.active = true ORDER BY g.id")
    Page<Game> findByCategoryAndActiveTrue(@Param("category") Game.Category category, Pageable pageable);
    
    // Find featured games with pagination - optimized
    @Query("SELECT g FROM Game g WHERE g.featured = true AND g.active = true ORDER BY g.id")
    Page<Game> findByFeaturedTrueAndActiveTrue(Pageable pageable);
    
    // Count methods
    long countByCategoryAndActiveTrue(Game.Category category);
    
    long countByFeaturedTrueAndActiveTrue();
    
    long countByActiveTrue();

    // RAWG import bookkeeping
    long countByRawgIdIsNotNull();
    long deleteByRawgIdIsNotNull();
    
    // Stock-related queries removed - stock is now calculated from SteamAccount relationships
    
    // Find games by release date range
    @Query("SELECT g FROM Game g WHERE g.releaseDate BETWEEN :startDate AND :endDate AND g.active = true ORDER BY g.id")
    List<Game> findByReleaseDateBetween(@Param("startDate") String startDate, @Param("endDate") String endDate);
    
    // Find games with metadata containing specific genre - optimized with JSON path
    @Query(value = "SELECT * FROM games WHERE active = true AND metadata::text LIKE CONCAT('%', :genre, '%') ORDER BY id", nativeQuery = true)
    List<Game> findByMetadataContainingGenre(@Param("genre") String genre);
    
    // Find games with metadata containing specific genre with pagination
    @Query(value = "SELECT * FROM games WHERE active = true AND metadata::text LIKE CONCAT('%', :genre, '%') ORDER BY id", nativeQuery = true)
    Page<Game> findByMetadataContainingGenrePage(@Param("genre") String genre, Pageable pageable);
    
    // Find games with metadata containing specific platform - optimized with JSON path
    @Query(value = "SELECT * FROM games WHERE active = true AND metadata::text LIKE CONCAT('%', :platform, '%') ORDER BY id", nativeQuery = true)
    List<Game> findByMetadataContainingPlatform(@Param("platform") String platform);
    
    // Find games with metadata containing specific developer - optimized with JSON path
    @Query(value = "SELECT * FROM games WHERE active = true AND metadata::text LIKE CONCAT('%', :developer, '%') ORDER BY id", nativeQuery = true)
    List<Game> findByMetadataContainingDeveloper(@Param("developer") String developer);
    
    // Find games with metadata containing specific publisher - optimized with JSON path
    @Query(value = "SELECT * FROM games WHERE active = true AND metadata::text LIKE CONCAT('%', :publisher, '%') ORDER BY id", nativeQuery = true)
    List<Game> findByMetadataContainingPublisher(@Param("publisher") String publisher);
    
    // Find games with specific rating range
    @Query("SELECT g FROM Game g WHERE g.rating BETWEEN :minRating AND :maxRating AND g.active = true ORDER BY g.id")
    List<Game> findByRatingBetween(@Param("minRating") Double minRating, @Param("maxRating") Double maxRating);
    
    // Price-related queries removed - prices are now calculated from SteamAccount relationships
    
    // Find games by multiple criteria - optimized (price criteria removed)
    @Query("SELECT g FROM Game g WHERE g.active = true AND " +
           "(:category IS NULL OR g.category = :category) AND " +
           "(:type IS NULL OR g.type = :type) AND " +
           "(:minRating IS NULL OR g.rating >= :minRating) " +
           "ORDER BY g.id")
    Page<Game> findByMultipleCriteria(
        @Param("category") Game.Category category,
        @Param("type") Game.Type type,
        @Param("minRating") Double minRating,
        Pageable pageable
    );
}

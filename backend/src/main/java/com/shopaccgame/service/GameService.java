package com.shopaccgame.service;

import com.shopaccgame.entity.Game;
import com.shopaccgame.dto.GameWithPriceDto;
import com.shopaccgame.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GameService {
    
    @Autowired
    private GameRepository gameRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * Clear Hibernate session cache to ensure fresh data from database
     */
    private void clearSessionCache() {
        entityManager.clear();
    }
    
    public List<GameWithPriceDto> getAllActiveGames() {
        clearSessionCache();
        List<Game> games = gameRepository.findByActiveTrueWithSteamAccounts();
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameWithPriceDto> getAllActiveGames(Pageable pageable) {
        clearSessionCache();
        // For pagination, we need to fetch IDs first, then fetch full entities with steam accounts
        Page<Long> gameIds = gameRepository.findActiveGameIds(pageable);
        List<Game> games = gameIds.getContent().stream()
                .map(id -> gameRepository.findByIdWithSteamAccounts(id).orElse(null))
                .filter(game -> game != null)
                .collect(Collectors.toList());
        
        List<GameWithPriceDto> dtoList = games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            dtoList, 
            pageable, 
            gameIds.getTotalElements()
        );
    }
    
    public Game getGameById(Long id) {
        clearSessionCache();
        return gameRepository.findByIdWithSteamAccounts(id)
            .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
    }
    
    public GameWithPriceDto getGameWithPriceById(Long id) {
        Game game = getGameById(id);
        return new GameWithPriceDto(game);
    }
    
    public List<GameWithPriceDto> getFeaturedGames() {
        List<Game> games = gameRepository.findByFeaturedTrueAndActiveTrueWithSteamAccounts();
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameWithPriceDto> getFeaturedGames(Pageable pageable) {
        // For pagination, we need to fetch IDs first, then fetch full entities with steam accounts
        Page<Long> gameIds = gameRepository.findFeaturedGameIds(pageable);
        List<Game> games = gameIds.getContent().stream()
                .map(id -> gameRepository.findByIdWithSteamAccounts(id).orElse(null))
                .filter(game -> game != null)
                .collect(Collectors.toList());
        
        List<GameWithPriceDto> dtoList = games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            dtoList, 
            pageable, 
            gameIds.getTotalElements()
        );
    }
    
    public List<GameWithPriceDto> getGamesByCategory(Game.Category category) {
        List<Game> games = gameRepository.findByCategoryAndActiveTrueWithSteamAccounts(category);
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameWithPriceDto> getGamesByCategory(Game.Category category, Pageable pageable) {
        // For pagination, we need to fetch IDs first, then fetch full entities with steam accounts
        Page<Long> gameIds = gameRepository.findGameIdsByCategory(category, pageable);
        List<Game> games = gameIds.getContent().stream()
                .map(id -> gameRepository.findByIdWithSteamAccounts(id).orElse(null))
                .filter(game -> game != null)
                .collect(Collectors.toList());
        
        List<GameWithPriceDto> dtoList = games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            dtoList, 
            pageable, 
            gameIds.getTotalElements()
        );
    }
    
    public List<GameWithPriceDto> getGamesByType(Game.Type type) {
        List<Game> games = gameRepository.findByTypeAndActiveTrueWithSteamAccounts(type);
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameWithPriceDto> searchGames(String keyword, Pageable pageable) {
        // For pagination, we need to fetch IDs first, then fetch full entities with steam accounts
        Page<Long> gameIds = gameRepository.findGameIdsBySearch(keyword, pageable);
        List<Game> games = gameIds.getContent().stream()
                .map(id -> gameRepository.findByIdWithSteamAccounts(id).orElse(null))
                .filter(game -> game != null)
                .collect(Collectors.toList());
        
        List<GameWithPriceDto> dtoList = games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            dtoList, 
            pageable, 
            gameIds.getTotalElements()
        );
    }
    
    public List<GameWithPriceDto> searchGamesByName(String searchTerm) {
        List<Game> games = gameRepository.searchByNameWithSteamAccounts(searchTerm);
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    // Price-related methods removed - prices are now calculated from SteamAccount relationships
    
    public List<Game> getGamesByRating(Double minRating) {
        return gameRepository.findByRatingGreaterThanEqualAndActiveTrue(minRating);
    }
    
    public List<Game> getGamesByGenre(String genre) {
        return gameRepository.findByMetadataContainingGenre(genre);
    }
    
    public Page<GameWithPriceDto> getGamesByGenrePage(String genre, Pageable pageable) {
        Page<Game> gamesPage = gameRepository.findByMetadataContainingGenrePage(genre, pageable);
        return gamesPage.map(GameWithPriceDto::new);
    }
    
    public List<Game> getGamesByPlatform(String platform) {
        return gameRepository.findByMetadataContainingPlatform(platform);
    }
    
    public Game createGame(Game game) {
        return gameRepository.save(game);
    }
    
    public Game updateGame(Long id, Game game) {
        Game existingGame = getGameById(id);
        existingGame.setName(game.getName());
        existingGame.setDescription(game.getDescription());
        // Price-related fields removed - now managed through SteamAccount relationships
        existingGame.setCategory(game.getCategory());
        existingGame.setType(game.getType());
        existingGame.setImageUrl(game.getImageUrl());
        // Stock quantity removed - now calculated from SteamAccount relationships
        existingGame.setActive(game.getActive());
        existingGame.setFeatured(game.getFeatured());
        existingGame.setRating(game.getRating());
        existingGame.setReleaseDate(game.getReleaseDate());
        existingGame.setMetadata(game.getMetadata());
        
        return gameRepository.save(existingGame);
    }
    
    public void deleteGame(Long id) {
        gameRepository.deleteById(id);
    }
    
    public long getGameCount() {
        return gameRepository.count();
    }
    
    public long getActiveGameCount() {
        return gameRepository.countByActiveTrue();
    }
    
    public long getFeaturedGameCount() {
        return gameRepository.countByFeaturedTrueAndActiveTrue();
    }
    
    public long getCategoryGameCount(Game.Category category) {
        return gameRepository.countByCategoryAndActiveTrue(category);
    }
    
    /**
     * Debug method to verify database state
     * @return List of all games with their active status
     */
    public List<Game> getAllGamesForDebug() {
        clearSessionCache();
        return gameRepository.findAll();
    }
    
    /**
     * Debug method to get all games with steam accounts
     * @return List of all games with steam accounts loaded
     */
    public List<GameWithPriceDto> getAllGamesWithSteamAccountsForDebug() {
        clearSessionCache();
        List<Game> games = gameRepository.findAll();
        return games.stream()
                .map(game -> {
                    // For debug, we'll fetch each game individually with steam accounts
                    return gameRepository.findByIdWithSteamAccounts(game.getId())
                            .map(GameWithPriceDto::new)
                            .orElse(null);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
    
    /**
     * Force refresh a specific game from database
     * @param id Game ID
     * @return Fresh game data from database
     */
    public Game refreshGameFromDatabase(Long id) {
        clearSessionCache();
        entityManager.flush();
        return gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
    }
}

package com.shopaccgame.service;

import com.shopaccgame.entity.Game;
import com.shopaccgame.dto.GameDto;
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
    
    public List<GameDto> getAllGames() {
        clearSessionCache();
        List<Game> games = gameRepository.findAll();
        return games.stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameDto> getAllGames(Pageable pageable) {
        clearSessionCache();
        Page<Game> games = gameRepository.findAll(pageable);
        List<GameDto> dtoList = games.getContent().stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            dtoList, 
            pageable, 
            games.getTotalElements()
        );
    }
    
    public Game getGameById(Long id) {
        clearSessionCache();
        return gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
    }
    
    public GameDto getGameDtoById(Long id) {
        Game game = getGameById(id);
        return new GameDto(game);
    }
    
    public List<GameDto> searchGames(String keyword) {
        List<Game> games = gameRepository.findByNameContainingIgnoreCase(keyword);
        return games.stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameDto> searchGames(String keyword, Pageable pageable) {
        Page<Game> games = gameRepository.findByNameContainingIgnoreCase(keyword, pageable);
        return games.map(GameDto::new);
    }
    
    public List<GameDto> searchGamesByName(String searchTerm) {
        List<Game> games = gameRepository.findByNameContainingIgnoreCase(searchTerm);
        return games.stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
    }
    
    public Game createGame(Game game) {
        return gameRepository.save(game);
    }
    
    public Game updateGame(Long id, Game game) {
        Game existingGame = getGameById(id);
        existingGame.setName(game.getName());
        existingGame.setDescription(game.getDescription());
        existingGame.setImageUrl(game.getImageUrl());
        
        return gameRepository.save(existingGame);
    }
    
    public void deleteGame(Long id) {
        gameRepository.deleteById(id);
    }
    
    public long getGameCount() {
        return gameRepository.count();
    }
    
    /**
     * Get count of active games (games with steam accounts available)
     * @return Count of games that have at least one available steam account
     */
    public long getActiveGameCount() {
        clearSessionCache();
        // For now, return all games as "active" since we don't have an active field
        // In the future, this could be based on games that have available steam accounts
        return gameRepository.count();
    }
    
    /**
     * Get count of featured games
     * @return Count of featured games (currently returns 0 since no featured field exists)
     */
    public long getFeaturedGameCount() {
        clearSessionCache();
        // For now, return 0 since we don't have a featured field
        // In the future, this could be based on a featured flag or other criteria
        return 0L;
    }
    
    /**
     * Debug method to verify database state
     * @return List of all games
     */
    public List<Game> getAllGamesForDebug() {
        clearSessionCache();
        return gameRepository.findAll();
    }
    
    /**
     * Debug method to get all games with steam accounts
     * @return List of all games with steam accounts loaded
     */
    public List<GameDto> getAllGamesWithSteamAccountsForDebug() {
        clearSessionCache();
        List<Game> games = gameRepository.findAll();
        return games.stream()
                .map(GameDto::new)
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

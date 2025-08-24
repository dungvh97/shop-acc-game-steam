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
    
    public List<GameWithPriceDto> getAllGames() {
        clearSessionCache();
        List<Game> games = gameRepository.findAll();
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameWithPriceDto> getAllGames(Pageable pageable) {
        clearSessionCache();
        Page<Game> games = gameRepository.findAll(pageable);
        List<GameWithPriceDto> dtoList = games.getContent().stream()
                .map(GameWithPriceDto::new)
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
    
    public GameWithPriceDto getGameWithPriceById(Long id) {
        Game game = getGameById(id);
        return new GameWithPriceDto(game);
    }
    
    public List<GameWithPriceDto> searchGames(String keyword) {
        List<Game> games = gameRepository.findByNameContainingIgnoreCase(keyword);
        return games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
    }
    
    public Page<GameWithPriceDto> searchGames(String keyword, Pageable pageable) {
        Page<Game> games = gameRepository.findByNameContainingIgnoreCase(keyword, pageable);
        return games.map(GameWithPriceDto::new);
    }
    
    public List<GameWithPriceDto> searchGamesByName(String searchTerm) {
        List<Game> games = gameRepository.findByNameContainingIgnoreCase(searchTerm);
        return games.stream()
                .map(GameWithPriceDto::new)
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
    public List<GameWithPriceDto> getAllGamesWithSteamAccountsForDebug() {
        clearSessionCache();
        List<Game> games = gameRepository.findAll();
        return games.stream()
                .map(GameWithPriceDto::new)
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

package com.shopaccgame.controller;

import com.shopaccgame.dto.GameDto;
import com.shopaccgame.dto.GameWithPriceDto;
import com.shopaccgame.dto.GamePageResponseDto;
import com.shopaccgame.dto.GameRequestDto;
import com.shopaccgame.entity.Game;
import com.shopaccgame.service.GameService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/games")
@CrossOrigin(origins = "*")
public class GameController {
    
    @Autowired
    private GameService gameService;
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("GameController is working!");
    }
    
    @GetMapping("/")
    public ResponseEntity<GamePageResponseDto> getAllGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GameWithPriceDto> games = gameService.getAllActiveGames(pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("")
    public ResponseEntity<GamePageResponseDto> getAllGamesRoot(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return getAllGames(page, size);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<GameWithPriceDto>> getAllActiveGames() {
        List<GameWithPriceDto> games = gameService.getAllActiveGames();
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/names")
    public ResponseEntity<List<Map<String, Object>>> getAllGameNames() {
        List<GameWithPriceDto> games = gameService.getAllActiveGames();
        List<Map<String, Object>> gameNames = games.stream()
                .map(game -> {
                    Map<String, Object> gameMap = new HashMap<>();
                    gameMap.put("id", game.getId());
                    gameMap.put("name", game.getName());
                    return gameMap;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(gameNames);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<GameWithPriceDto> getGameById(@PathVariable Long id) {
        GameWithPriceDto game = gameService.getGameWithPriceById(id);
        return ResponseEntity.ok(game);
    }
    
    @GetMapping("/featured")
    public ResponseEntity<GamePageResponseDto> getFeaturedGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GameWithPriceDto> games = gameService.getFeaturedGames(pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("/featured/all")
    public ResponseEntity<List<GameWithPriceDto>> getAllFeaturedGames() {
        List<GameWithPriceDto> games = gameService.getFeaturedGames();
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<GamePageResponseDto> getGamesByCategory(
            @PathVariable Game.Category category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GameWithPriceDto> games = gameService.getGamesByCategory(category, pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("/category/{category}/all")
    public ResponseEntity<List<GameWithPriceDto>> getAllGamesByCategory(
            @PathVariable Game.Category category) {
        List<GameWithPriceDto> games = gameService.getGamesByCategory(category);
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/search")
    public ResponseEntity<GamePageResponseDto> searchGames(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GameWithPriceDto> games = gameService.searchGames(keyword, pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("/search/name")
    public ResponseEntity<List<GameWithPriceDto>> searchGamesByName(
            @RequestParam String searchTerm) {
        List<GameWithPriceDto> games = gameService.searchGamesByName(searchTerm);
        return ResponseEntity.ok(games);
    }
    
    // Price-related endpoints removed - prices are now calculated from SteamAccount relationships
    
    @GetMapping("/rating")
    public ResponseEntity<List<GameDto>> getGamesByRating(
            @RequestParam(defaultValue = "4.0") Double minRating) {
        List<Game> games = gameService.getGamesByRating(minRating);
        List<GameDto> gameDtos = games.stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(gameDtos);
    }
    
    @GetMapping("/genre/{genre}")
    public ResponseEntity<GamePageResponseDto> getGamesByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GameWithPriceDto> games = gameService.getGamesByGenrePage(genre, pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("/genre/{genre}/all")
    public ResponseEntity<List<GameWithPriceDto>> getAllGamesByGenre(
            @PathVariable String genre) {
        List<Game> games = gameService.getGamesByGenre(genre);
        List<GameWithPriceDto> gameDtos = games.stream()
                .map(GameWithPriceDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(gameDtos);
    }
    
    @GetMapping("/platform/{platform}")
    public ResponseEntity<List<GameDto>> getGamesByPlatform(
            @PathVariable String platform) {
        List<Game> games = gameService.getGamesByPlatform(platform);
        List<GameDto> gameDtos = games.stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(gameDtos);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGameStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGames", gameService.getGameCount());
        stats.put("activeGames", gameService.getActiveGameCount());
        stats.put("featuredGames", gameService.getFeaturedGameCount());
        
        // Category stats
        Map<String, Long> categoryStats = new HashMap<>();
        for (Game.Category category : Game.Category.values()) {
            categoryStats.put(category.name(), gameService.getCategoryGameCount(category));
        }
        stats.put("categoryStats", categoryStats);
        
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping
    public ResponseEntity<GameDto> createGame(@Valid @RequestBody GameRequestDto gameRequest) {
        Game game = gameRequest.toEntity();
        Game createdGame = gameService.createGame(game);
        return ResponseEntity.ok(new GameDto(createdGame));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<GameDto> updateGame(
            @PathVariable Long id, 
            @Valid @RequestBody GameRequestDto gameRequest) {
        Game existingGame = gameService.getGameById(id);
        gameRequest.updateEntity(existingGame);
        Game updatedGame = gameService.updateGame(id, existingGame);
        return ResponseEntity.ok(new GameDto(updatedGame));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.ok().build();
    }
    
    // Debug endpoints to help identify data discrepancy issues
    @GetMapping("/debug/all")
    public ResponseEntity<List<GameDto>> getAllGamesForDebug() {
        List<Game> games = gameService.getAllGamesForDebug();
        List<GameDto> gameDtos = games.stream()
                .map(GameDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(gameDtos);
    }
    
    @GetMapping("/debug/all-with-steam-accounts")
    public ResponseEntity<List<GameWithPriceDto>> getAllGamesWithSteamAccountsForDebug() {
        List<GameWithPriceDto> games = gameService.getAllGamesWithSteamAccountsForDebug();
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/debug/refresh/{id}")
    public ResponseEntity<GameDto> refreshGameFromDatabase(@PathVariable Long id) {
        Game game = gameService.refreshGameFromDatabase(id);
        return ResponseEntity.ok(new GameDto(game));
    }
    
    @GetMapping("/debug/active-count")
    public ResponseEntity<Map<String, Object>> getActiveGameCount() {
        Map<String, Object> response = new HashMap<>();
        response.put("activeGamesCount", gameService.getActiveGameCount());
        response.put("totalGamesCount", gameService.getGameCount());
        response.put("featuredGamesCount", gameService.getFeaturedGameCount());
        return ResponseEntity.ok(response);
    }
}

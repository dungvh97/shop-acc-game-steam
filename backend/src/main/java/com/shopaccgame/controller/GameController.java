package com.shopaccgame.controller;

import com.shopaccgame.dto.GameDto;
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
        Page<GameDto> games = gameService.getAllGames(pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("")
    public ResponseEntity<GamePageResponseDto> getAllGamesRoot(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return getAllGames(page, size);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<GameDto>> getAllGames() {
        List<GameDto> games = gameService.getAllGames();
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/names")
    public ResponseEntity<List<Map<String, Object>>> getAllGameNames() {
        List<GameDto> games = gameService.getAllGames();
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
    public ResponseEntity<GameDto> getGameById(@PathVariable Long id) {
        GameDto game = gameService.getGameDtoById(id);
        return ResponseEntity.ok(game);
    }
    
    @GetMapping("/search")
    public ResponseEntity<GamePageResponseDto> searchGames(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GameDto> games = gameService.searchGames(keyword, pageable);
        return ResponseEntity.ok(GamePageResponseDto.from(games));
    }
    
    @GetMapping("/search/name")
    public ResponseEntity<List<GameDto>> searchGamesByName(
            @RequestParam String searchTerm) {
        List<GameDto> games = gameService.searchGamesByName(searchTerm);
        return ResponseEntity.ok(games);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGameStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGames", gameService.getGameCount());
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
        return ResponseEntity.noContent().build();
    }
}

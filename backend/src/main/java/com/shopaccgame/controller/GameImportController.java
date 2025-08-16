package com.shopaccgame.controller;

import com.shopaccgame.service.GameImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/games")
@PreAuthorize("hasRole('ADMIN')")
public class GameImportController {

    private static final Logger logger = LoggerFactory.getLogger(GameImportController.class);
    
    @Autowired
    private GameImportService gameImportService;

    /**
     * Import games from RAWG.io API
     * @param pageSize Number of games per page (default: 20)
     * @param maxPages Maximum number of pages to import (default: 10)
     * @return Import status
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importGames(
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "10") int maxPages) {
        
        logger.info("Starting game import: {} pages, {} games per page", maxPages, pageSize);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Game import started");
        response.put("pageSize", pageSize);
        response.put("maxPages", maxPages);
        response.put("status", "processing");
        
        // Run import in background thread
        new Thread(() -> {
            try {
                gameImportService.importGamesFromRawg(pageSize, maxPages);
                logger.info("Game import completed successfully");
            } catch (Exception e) {
                logger.error("Error during game import", e);
            }
        }).start();
        
        return ResponseEntity.ok(response);
    }





    /**
     * Get import status
     * @return Current import status
     */
    @GetMapping("/import/status")
    public ResponseEntity<Map<String, Object>> getImportStatus() {
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Import status check");
        response.put("status", "available");
        response.put("timestamp", System.currentTimeMillis());
        try {
            int fetched = gameImportService.testRawgConnectivity(5);
            response.put("rawgReachable", true);
            response.put("sampleFetched", fetched);
        } catch (Exception e) {
            response.put("rawgReachable", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Clear all imported games
     * @return Clear status
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearImportedGames() {
        
        logger.info("Clearing all imported games");
        
        Map<String, Object> response = new HashMap<>();
        int deleted = 0;
        try {
            // remove only RAWG-imported products
            deleted = gameImportService.clearImportedGames();
            response.put("message", "Games cleared successfully");
            response.put("status", "completed");
            response.put("deleted", deleted);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}

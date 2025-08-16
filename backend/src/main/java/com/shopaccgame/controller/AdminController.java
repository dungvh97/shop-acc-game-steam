package com.shopaccgame.controller;

import com.shopaccgame.service.GameService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private GameService gameService;



    /**
     * Get database statistics
     * @return Database stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDatabaseStats() {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            response.put("totalGames", gameService.getGameCount());
            response.put("activeGames", gameService.getActiveGameCount());
            response.put("featuredGames", gameService.getFeaturedGameCount());
            response.put("status", "success");
            response.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            logger.error("Failed to get database stats", e);
            response.put("status", "error");
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Clear all data
     * @return Clear status
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllData() {
        
        logger.info("Clearing all data...");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // This would need to be implemented in GameService
            // For now, just return a message
            response.put("message", "Clear all data endpoint - implementation needed");
            response.put("status", "not_implemented");
            
        } catch (Exception e) {
            logger.error("Failed to clear data", e);
            response.put("status", "error");
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}

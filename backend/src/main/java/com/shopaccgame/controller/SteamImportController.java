package com.shopaccgame.controller;

import com.shopaccgame.service.SteamImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/admin/steam-import")
@CrossOrigin(origins = "*")
public class SteamImportController {
    
    @Autowired
    private SteamImportService steamImportService;
    
    /**
     * Check if Steam import has been done before
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getImportStatus() {
        Map<String, Object> response = new HashMap<>();
        
        boolean hasBeenImported = steamImportService.hasSteamImportBeenDone();
        response.put("hasBeenImported", hasBeenImported);
        
        if (hasBeenImported) {
            LocalDateTime lastImport = steamImportService.getLastSteamImportDate();
            if (lastImport != null) {
                response.put("lastImportDate", lastImport.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            }
        }
        
        // Add count of imported games
        long importedCount = steamImportService.getImportedSteamGamesCount();
        response.put("importedGamesCount", importedCount);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Start Steam games import process
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startImport() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Start import process asynchronously
            CompletableFuture<String> importFuture = steamImportService.importSteamGamesAsync();
            
            response.put("success", true);
            response.put("message", "Đang nhập steam game tại nền, thời gian hoàn thành dự kiến 24h");
            response.put("status", "started");
            
            // Handle completion in background
            importFuture.whenComplete((result, throwable) -> {
                if (throwable != null) {
                    System.err.println("Steam import failed: " + throwable.getMessage());
                } else {
                    System.out.println("Steam import completed: " + result);
                }
            });
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi bắt đầu nhập Steam games: " + e.getMessage());
            response.put("status", "error");
        }
        
        return ResponseEntity.ok(response);
    }
}

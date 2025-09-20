package com.shopaccgame.service;

import com.shopaccgame.entity.Game;
import com.shopaccgame.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class SteamImportService {
    
    @Autowired
    private GameRepository gameRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${app.upload.path:uploads}")
    private String uploadPath;
    
    private static final String STEAMSPY_API_URL = "https://steamspy.com/api.php?request=all";
    private static final String STEAM_STORE_API_URL = "https://store.steampowered.com/api/appdetails";
    
    /**
     * Get the last Steam import date
     */
    public LocalDateTime getLastSteamImportDate() {
        return gameRepository.findTopByOrderByLastSteamImportDesc()
                .map(Game::getLastSteamImport)
                .orElse(null);
    }
    
    /**
     * Check if Steam import has been done before
     */
    public boolean hasSteamImportBeenDone() {
        return getLastSteamImportDate() != null;
    }
    
    /**
     * Get count of imported Steam games
     */
    public long getImportedSteamGamesCount() {
        return gameRepository.countBySteamAppIdIsNotNull();
    }
    
    /**
     * Import popular Steam games asynchronously
     */
    public CompletableFuture<String> importSteamGamesAsync() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return importSteamGames();
            } catch (Exception e) {
                throw new RuntimeException("Failed to import Steam games: " + e.getMessage(), e);
            }
        });
    }
    
    /**
     * Import popular Steam games in batches
     */
    public String importSteamGames() {
        try {
            // Step 1: Get popular games from SteamSpy
            Map<String, Object> steamSpyData = getSteamSpyData();
            if (steamSpyData == null || steamSpyData.isEmpty()) {
                return "No data received from SteamSpy API";
            }
            
            // Step 2: Filter and prepare games for import
            List<String> validAppIds = new ArrayList<>();
            for (Map.Entry<String, Object> entry : steamSpyData.entrySet()) {
                String appId = entry.getKey();
                @SuppressWarnings("unchecked")
                Map<String, Object> gameData = (Map<String, Object>) entry.getValue();
                
                // Skip if not a valid app ID or if it's not a game
                if (!isValidAppId(appId) || !isGame(gameData)) {
                    continue;
                }
                
                // Check if game already exists
                if (gameRepository.findBySteamAppId(Long.parseLong(appId)).isPresent()) {
                    continue;
                }
                
                validAppIds.add(appId);
            }
            
            System.out.println("Found " + validAppIds.size() + " valid games to import");
            
            // Step 3: Process in batches of 100
            int batchSize = 100;
            int totalImported = 0;
            int totalErrors = 0;
            
            for (int i = 0; i < validAppIds.size(); i += batchSize) {
                int endIndex = Math.min(i + batchSize, validAppIds.size());
                List<String> batch = validAppIds.subList(i, endIndex);
                
                System.out.println("Processing batch " + (i / batchSize + 1) + " of " + 
                    ((validAppIds.size() + batchSize - 1) / batchSize) + 
                    " (games " + (i + 1) + "-" + endIndex + ")");
                
                int batchImported = 0;
                int batchErrors = 0;
                
                for (String appId : batch) {
                    try {
                        // Get detailed game info from Steam Store API with retry logic
                        Map<String, Object> steamStoreData = getSteamStoreDataWithRetry(appId);
                        if (steamStoreData == null) {
                            batchErrors++;
                            continue;
                        }
                        
                        // Create and save game
                        Game game = createGameFromSteamData(appId, steamStoreData);
                        if (game != null) {
                            gameRepository.save(game);
                            batchImported++;
                            System.out.println("Imported game: " + appId + " - " + game.getName());
                        }
                        
                        // Respect rate limits - sleep between requests
                        Thread.sleep(100); // 100ms delay between requests
                        
                    } catch (Exception e) {
                        batchErrors++;
                        System.err.println("Error processing game " + appId + ": " + e.getMessage());
                    }
                }
                
                totalImported += batchImported;
                totalErrors += batchErrors;
                
                System.out.println("Batch " + (i / batchSize + 1) + " completed. Imported: " + 
                    batchImported + ", Errors: " + batchErrors);
                
                // Sleep for 1 minute between batches (except for the last batch)
                if (i + batchSize < validAppIds.size()) {
                    System.out.println("Waiting 1 minute before next batch...");
                    Thread.sleep(60000); // 1 minute delay between batches
                }
            }
            
            System.out.println("Import completed. Total imported: " + totalImported + ", Total errors: " + totalErrors);
            return String.format("Import completed. Imported: %d games, Errors: %d", totalImported, totalErrors);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to import Steam games: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get data from SteamSpy API
     */
    private Map<String, Object> getSteamSpyData() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                STEAMSPY_API_URL, 
                HttpMethod.GET, 
                entity, 
                Map.class
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = response.getBody();
            return responseBody;
        } catch (Exception e) {
            System.err.println("Error fetching SteamSpy data: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Get detailed game data from Steam Store API with retry logic
     */
    private Map<String, Object> getSteamStoreDataWithRetry(String appId) {
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                return getSteamStoreData(appId);
            } catch (Exception e) {
                String errorMessage = e.getMessage();
                if (errorMessage != null && errorMessage.contains("429 Too Many Requests")) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        int waitMinutes = 10 * retryCount; // Exponential backoff: 10, 20, 30 minutes
                        System.err.println("Rate limit exceeded for app " + appId + 
                            ". Waiting " + waitMinutes + " minutes before retry " + retryCount + "/" + maxRetries);
                        
                        try {
                            Thread.sleep(waitMinutes * 60 * 1000); // Convert minutes to milliseconds
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            System.err.println("Interrupted while waiting for rate limit reset");
                            return null;
                        }
                    } else {
                        System.err.println("Max retries exceeded for app " + appId + ". Skipping.");
                        return null;
                    }
                } else {
                    // Non-rate-limit error, don't retry
                    System.err.println("Error fetching Steam Store data for app " + appId + ": " + errorMessage);
                    return null;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Get detailed game data from Steam Store API
     */
    private Map<String, Object> getSteamStoreData(String appId) {
        String url = STEAM_STORE_API_URL + "?appids=" + appId + "&cc=vn&l=vietnamese";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        @SuppressWarnings("rawtypes")
        ResponseEntity<Map> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            Map.class
        );
        
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null && responseBody.containsKey(appId)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> appData = (Map<String, Object>) responseBody.get(appId);
            if (Boolean.TRUE.equals(appData.get("success"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) appData.get("data");
                return data;
            }
        }
        
        return null;
    }
    
    /**
     * Create Game entity from Steam data
     */
    private Game createGameFromSteamData(String appId, Map<String, Object> steamData) {
        try {
            Game game = new Game();
            game.setSteamAppId(Long.parseLong(appId));
            game.setLastSteamImport(LocalDateTime.now());
            
            // Set basic info
            game.setName(getStringValue(steamData, "name"));
            game.setDescription(getStringValue(steamData, "detailed_description"));
            game.setWebsite(getStringValue(steamData, "website"));
            
            // Set PC requirements
            @SuppressWarnings("unchecked")
            Map<String, Object> pcRequirements = (Map<String, Object>) steamData.get("pc_requirements");
            if (pcRequirements != null) {
                String minimum = getStringValue(pcRequirements, "minimum");
                if (minimum != null && !minimum.isEmpty()) {
                    game.setPcRequirements(minimum);
                }
            }
            
            // Download and save image
            String headerImage = getStringValue(steamData, "header_image");
            if (headerImage != null && !headerImage.isEmpty()) {
                String imagePath = downloadAndSaveImage(headerImage, appId);
                if (imagePath != null) {
                    game.setImageUrl(imagePath);
                }
            }
            
            return game;
        } catch (Exception e) {
            System.err.println("Error creating game from Steam data: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Download image from URL and save to local storage
     */
    private String downloadAndSaveImage(String imageUrl, String appId) {
        try {
            // Create games directory if it doesn't exist
            Path gamesDir = Paths.get(uploadPath, "games");
            Files.createDirectories(gamesDir);
            
            // Download image
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            if (imageBytes == null || imageBytes.length == 0) {
                return null;
            }
            
            // Determine file extension
            String extension = "jpg";
            if (imageUrl.toLowerCase().contains(".png")) {
                extension = "png";
            } else if (imageUrl.toLowerCase().contains(".gif")) {
                extension = "gif";
            }
            
            // Save image
            String fileName = "game_" + appId + "." + extension;
            Path imagePath = gamesDir.resolve(fileName);
            Files.write(imagePath, imageBytes);
            
            // Return relative path
            return "/uploads/games/" + fileName;
            
        } catch (Exception e) {
            System.err.println("Error downloading image for app " + appId + ": " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Helper method to safely get string value from map
     */
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
    
    /**
     * Check if app ID is valid
     */
    private boolean isValidAppId(String appId) {
        try {
            Long.parseLong(appId);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * Check if the data represents a game (not DLC, software, etc.)
     */
    private boolean isGame(Map<String, Object> gameData) {
        // Check if it has required fields for a game
        return gameData.containsKey("name") && 
               gameData.get("name") != null && 
               !gameData.get("name").toString().isEmpty();
    }
}

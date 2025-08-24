package com.shopaccgame.service;

import com.shopaccgame.entity.Game;
import com.shopaccgame.repository.GameRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Random;

@Service
public class GameImportService {

    private static final Logger logger = LoggerFactory.getLogger(GameImportService.class);
    
    @Value("${rawg.api.key}")
    private String rawgApiKey;
    
    @Value("${rawg.api.base-url:https://api.rawg.io/api}")
    private String rawgBaseUrl;
    
    @Value("${app.images.directory:./uploads/games}")
    private String imagesDirectory;
    
    @Autowired
    private GameRepository gameRepository;
    
    @Autowired
    private RestTemplate restTemplate;

    /**
     * Import games from RAWG.io API
     * @param pageSize Number of games to import per page
     * @param maxPages Maximum number of pages to import
     */
    public void importGamesFromRawg(int pageSize, int maxPages) {
        logger.info("Starting game import from RAWG.io...");
        
        try {
            // Create images directory if it doesn't exist
            createImagesDirectory();
            
            int totalImported = 0;
            
            for (int page = 1; page <= maxPages; page++) {
                logger.info("Importing page {} of {}", page, maxPages);
                
                String url = String.format("%s/games?key=%s&page_size=%d&page=%d&ordering=-rating",
                    rawgBaseUrl, rawgApiKey, pageSize, page);
                
                RawgResponse response = restTemplate.getForObject(url, RawgResponse.class);
                
                if (response != null && response.results != null) {
                    int importedInPage = importGamesFromResponse(response.results);
                    totalImported += importedInPage;
                    logger.info("Imported {} games from page {}", importedInPage, page);
                    
                    // Add delay to respect API rate limits
                    Thread.sleep(1000);
                } else {
                    logger.warn("No data received from RAWG API for page {}", page);
                    break;
                }
            }
            
            logger.info("Game import completed. Total imported: {}", totalImported);
            
        } catch (Exception e) {
            logger.error("Error during game import", e);
        }
    }

    /**
     * Import specific games by genre
     * @param genre Genre to import
     * @param pageSize Number of games per page
     * @param maxPages Maximum pages to import
     */
    public void importGamesByGenre(String genre, int pageSize, int maxPages) {
        logger.info("Starting import for genre: {}", genre);
        
        try {
            createImagesDirectory();
            
            int totalImported = 0;
            
            for (int page = 1; page <= maxPages; page++) {
                String url = String.format("%s/games?key=%s&page_size=%d&page=%d&genres=%s&ordering=-rating",
                    rawgBaseUrl, rawgApiKey, pageSize, page, genre);
                
                RawgResponse response = restTemplate.getForObject(url, RawgResponse.class);
                
                if (response != null && response.results != null) {
                    int importedInPage = importGamesFromResponse(response.results);
                    totalImported += importedInPage;
                    logger.info("Imported {} {} games from page {}", importedInPage, genre, page);
                    
                    Thread.sleep(1000);
                } else {
                    break;
                }
            }
            
            logger.info("Genre import completed for {}. Total imported: {}", genre, totalImported);
            
        } catch (Exception e) {
            logger.error("Error during genre import", e);
        }
    }

    /**
     * Quick connectivity test to RAWG API; returns number of items fetched
     */
    public int testRawgConnectivity(int pageSize) {
        try {
            String url = String.format("%s/games?key=%s&page_size=%d&page=1&ordering=-rating",
                rawgBaseUrl, rawgApiKey, pageSize);
            RawgResponse response = restTemplate.getForObject(url, RawgResponse.class);
            int count = (response != null && response.results != null) ? response.results.size() : 0;
            logger.info("RAWG test success: fetched {} items (page_size={})", count, pageSize);
            return count;
        } catch (Exception e) {
            logger.error("RAWG test failed: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Clear all imported games
     * @return number of rows deleted
     */
    public int clearImportedGames() {
        long before = gameRepository.count();
        gameRepository.deleteAll();
        long after = gameRepository.count();
        return Math.toIntExact(before - after);
    }

    private int importGamesFromResponse(List<RawgGame> games) {
        int imported = 0;
        
        for (RawgGame rawgGame : games) {
            try {
                // Check if game with same name already exists
                List<Game> existingGames = gameRepository.findByNameContainingIgnoreCase(rawgGame.name);
                if (!existingGames.isEmpty()) {
                    logger.debug("Game {} already exists, skipping", rawgGame.name);
                    continue;
                }
                
                Game game = convertRawgGameToGame(rawgGame);
                
                gameRepository.save(game);
                imported++;
                
                logger.debug("Imported game: {}", rawgGame.name);
                
            } catch (Exception e) {
                logger.error("Error importing game: {}", rawgGame.name, e);
            }
        }
        
        return imported;
    }

    private Game convertRawgGameToGame(RawgGame rawgGame) {
        Game game = new Game();
        
        game.setName(rawgGame.name);
        game.setDescription(rawgGame.description != null ? 
            rawgGame.description.replaceAll("<[^>]*>", "") : "No description available");
        
        // Download and save image if available
        if (rawgGame.background_image != null && !rawgGame.background_image.isEmpty()) {
            try {
                String imageUrl = downloadAndSaveImage(rawgGame.background_image, rawgGame.id);
                if (imageUrl != null) {
                    game.setImageUrl(imageUrl);
                }
            } catch (Exception e) {
                logger.warn("Failed to download image for game {}: {}", rawgGame.name, e.getMessage());
            }
        }
        
        return game;
    }

    private String downloadAndSaveImage(String imageUrl, Long gameId) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        try {
            // Create filename
            String filename = "game_" + gameId + ".jpg";
            Path imagePath = Paths.get(imagesDirectory, filename);
            
            // Download image
            URL url = new URL(imageUrl);
            try (InputStream in = url.openStream();
                 FileOutputStream out = new FileOutputStream(imagePath.toFile())) {
                
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }
            
            // Return relative path for database storage
            return "/uploads/games/" + filename;
            
        } catch (IOException e) {
            logger.error("Error downloading image for game {}: {}", gameId, e.getMessage());
            return null;
        }
    }

    private void createImagesDirectory() throws IOException {
        Path dir = Paths.get(imagesDirectory);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
            logger.info("Created images directory: {}", imagesDirectory);
        }
    }

    // RAWG API Response Classes
    public static class RawgResponse {
        public int count;
        public String next;
        public String previous;
        public List<RawgGame> results;
    }

    public static class RawgGame {
        public Long id;
        public String name;
        public String description;
        public String background_image;
        public Double rating;
        public String released;
        public Integer metacritic;
        public Integer playtime;
        public EsrbRating esrb_rating;
        public String website;
        public List<Platform> platforms;
        public List<Genre> genres;
        public List<Tag> tags;
        public List<Developer> developers;
        public List<Publisher> publishers;
    }

    public static class EsrbRating {
        public String name;
    }

    public static class Platform {
        public PlatformInfo platform;
    }

    public static class PlatformInfo {
        public String name;
    }

    public static class Genre {
        public String name;
    }

    public static class Tag {
        public String name;
    }

    public static class Developer {
        public String name;
    }

    public static class Publisher {
        public String name;
    }
}

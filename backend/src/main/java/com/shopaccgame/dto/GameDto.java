package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class GameDto {
    private Long id;
    private String name;
    // Title field removed - using name field for display
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private Game.Category category;
    private Game.Type type;
    private String imageUrl;
    private Integer stockQuantity;
    private Boolean active;
    private Boolean featured;
    private BigDecimal rating;
    private String releaseDate;
    private String metadata;
    private Long rawgId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields from metadata
    private List<String> genres;
    private List<String> platforms;
    private List<String> developers;
    private List<String> publishers;
    private List<String> tags;
    private Integer metacritic;
    private Integer playtime;
    private String esrbRating;
    private String website;

    // Constructors
    public GameDto() {}

    public GameDto(Game game) {
        this.id = game.getId();
        this.name = game.getName();
        // Title field removed - using name field for display
        this.description = game.getDescription();
        // Price-related fields removed - prices are now calculated from SteamAccount relationships
        this.price = game.getCalculatedPrice();
        this.originalPrice = null; // Not available from SteamAccount relationships
        this.discountPercentage = null; // Not available from SteamAccount relationships
        this.category = game.getCategory();
        this.type = game.getType();
        this.imageUrl = game.getImageUrl();
        this.stockQuantity = game.getCalculatedStockQuantity();
        this.active = game.getActive();
        this.featured = game.getFeatured();
        this.rating = game.getRating();
        this.releaseDate = game.getReleaseDate();
        this.metadata = game.getMetadata();
        this.rawgId = game.getRawgId();
        this.createdAt = game.getCreatedAt();
        this.updatedAt = game.getUpdatedAt();
        
        // Parse metadata if available
        if (game.getMetadata() != null && !game.getMetadata().isEmpty()) {
            try {
                // Simple JSON parsing for metadata
                String metadata = game.getMetadata();
                // Extract genres, platforms, etc. from metadata JSON
                // This is a simplified approach - in production you might want to use a proper JSON parser
                if (metadata.contains("\"genres\"")) {
                    // Extract genres from metadata
                    this.genres = extractListFromJson(metadata, "genres");
                }
                if (metadata.contains("\"platforms\"")) {
                    this.platforms = extractListFromJson(metadata, "platforms");
                }
                if (metadata.contains("\"developers\"")) {
                    this.developers = extractListFromJson(metadata, "developers");
                }
                if (metadata.contains("\"publishers\"")) {
                    this.publishers = extractListFromJson(metadata, "publishers");
                }
                if (metadata.contains("\"tags\"")) {
                    this.tags = extractListFromJson(metadata, "tags");
                }
            } catch (Exception e) {
                // If metadata parsing fails, continue without the additional fields
                System.err.println("Error parsing metadata for game " + game.getId() + ": " + e.getMessage());
            }
        }
    }

    // Helper method to extract lists from JSON metadata
    private List<String> extractListFromJson(String json, String fieldName) {
        // This is a simplified JSON parser - in production use a proper JSON library
        try {
            int startIndex = json.indexOf("\"" + fieldName + "\":[");
            if (startIndex == -1) return null;
            
            startIndex = json.indexOf("[", startIndex);
            int endIndex = json.indexOf("]", startIndex);
            
            if (startIndex == -1 || endIndex == -1) return null;
            
            String arrayContent = json.substring(startIndex + 1, endIndex);
            // Simple parsing - split by comma and remove quotes
            String[] items = arrayContent.split(",");
            List<String> result = new java.util.ArrayList<>();
            
            for (String item : items) {
                item = item.trim().replaceAll("\"", "");
                if (!item.isEmpty()) {
                    result.add(item);
                }
            }
            
            return result;
        } catch (Exception e) {
            return null;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Title field removed - using name field for display

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Game.Category getCategory() {
        return category;
    }

    public void setCategory(Game.Category category) {
        this.category = category;
    }

    public Game.Type getType() {
        return type;
    }

    public void setType(Game.Type type) {
        this.type = type;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Long getRawgId() {
        return rawgId;
    }

    public void setRawgId(Long rawgId) {
        this.rawgId = rawgId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public List<String> getDevelopers() {
        return developers;
    }

    public void setDevelopers(List<String> developers) {
        this.developers = developers;
    }

    public List<String> getPublishers() {
        return publishers;
    }

    public void setPublishers(List<String> publishers) {
        this.publishers = publishers;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Integer getMetacritic() {
        return metacritic;
    }

    public void setMetacritic(Integer metacritic) {
        this.metacritic = metacritic;
    }

    public Integer getPlaytime() {
        return playtime;
    }

    public void setPlaytime(Integer playtime) {
        this.playtime = playtime;
    }

    public String getEsrbRating() {
        return esrbRating;
    }

    public void setEsrbRating(String esrbRating) {
        this.esrbRating = esrbRating;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}

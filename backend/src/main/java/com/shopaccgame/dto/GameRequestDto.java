package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class GameRequestDto {
    
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;
    
    // Title field removed - using name field for display
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    // Price and stock-related fields removed - these are now managed through SteamAccount relationships
    
    private Boolean active = true;
    private Boolean featured = false;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    @Min(value = 1, message = "RAWG ID must be positive")
    private Long rawgId;
    
    @NotNull(message = "Category is required")
    private Game.Category category;
    
    @NotNull(message = "Type is required")
    private Game.Type type;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Rating must be at least 0")
    @DecimalMax(value = "5.0", inclusive = true, message = "Rating must be at most 5")
    private BigDecimal rating;
    
    @Size(max = 50, message = "Release date must not exceed 50 characters")
    private String releaseDate;
    
    private String metadata;
    
    // Additional fields for enhanced data
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
    public GameRequestDto() {}

    // Convert to entity
    public Game toEntity() {
        Game game = new Game();
        game.setName(this.name);
        // Title field removed - using name field for display
        game.setDescription(this.description);
        // Price and stock-related fields removed - these are now managed through SteamAccount relationships
        game.setActive(this.active);
        game.setFeatured(this.featured);
        game.setImageUrl(this.imageUrl);
        game.setRawgId(this.rawgId);
        game.setCategory(this.category);
        game.setType(this.type);
        game.setRating(this.rating);
        game.setReleaseDate(this.releaseDate);
        game.setMetadata(this.metadata);
        return game;
    }

    // Update existing entity
    public void updateEntity(Game game) {
        if (this.name != null) game.setName(this.name);
        // Title field removed - using name field for display
        if (this.description != null) game.setDescription(this.description);
        // Price and stock-related fields removed - these are now managed through SteamAccount relationships
        if (this.active != null) game.setActive(this.active);
        if (this.featured != null) game.setFeatured(this.featured);
        if (this.imageUrl != null) game.setImageUrl(this.imageUrl);
        if (this.rawgId != null) game.setRawgId(this.rawgId);
        if (this.category != null) game.setCategory(this.category);
        if (this.type != null) game.setType(this.type);
        if (this.rating != null) game.setRating(this.rating);
        if (this.releaseDate != null) game.setReleaseDate(this.releaseDate);
        if (this.metadata != null) game.setMetadata(this.metadata);
    }

    // Getters and Setters
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

    // Price and stock-related getters/setters removed - these are now managed through SteamAccount relationships

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getRawgId() {
        return rawgId;
    }

    public void setRawgId(Long rawgId) {
        this.rawgId = rawgId;
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

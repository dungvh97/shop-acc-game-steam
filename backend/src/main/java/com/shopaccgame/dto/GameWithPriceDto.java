package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;
import java.math.BigDecimal;

public class GameWithPriceDto {
    private Long id;
    private String name;
    // Title field removed - using name field for display
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private String category;
    private String type;
    private String imageUrl;
    private Integer stockQuantity;
    private Boolean active;
    private Boolean featured;
    private BigDecimal rating;
    private String releaseDate;
    private String metadata;
    private Long rawgId;
    private Boolean inStock;
    
    public GameWithPriceDto() {}
    
    public GameWithPriceDto(Game game) {
        this.id = game.getId();
        this.name = game.getName();
        // Title field removed - using name field for display
        this.description = game.getDescription();
        this.category = game.getCategory().name();
        this.type = game.getType().name();
        this.imageUrl = game.getImageUrl();
        this.active = game.getActive();
        this.featured = game.getFeatured();
        this.rating = game.getRating();
        this.releaseDate = game.getReleaseDate();
        this.metadata = game.getMetadata();
        this.rawgId = game.getRawgId();
        
        // Calculate price and stock from SteamAccount relationships
        this.price = game.getCalculatedPrice();
        this.stockQuantity = game.getCalculatedStockQuantity();
        this.inStock = game.isInStock();
        
        // Set original price and discount percentage to null for now
        // These can be calculated later if needed from SteamAccount data
        this.originalPrice = null;
        this.discountPercentage = null;
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
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
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
    
    public Boolean getInStock() {
        return inStock;
    }
    
    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }
}

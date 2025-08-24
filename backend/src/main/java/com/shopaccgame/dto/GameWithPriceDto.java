package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountStatus;
import java.math.BigDecimal;

public class GameWithPriceDto {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean inStock;
    
    public GameWithPriceDto() {}
    
    public GameWithPriceDto(Game game) {
        this.id = game.getId();
        this.name = game.getName();
        this.description = game.getDescription();
        this.imageUrl = game.getImageUrl();
        
        // Calculate price and stock from SteamAccount relationships
        this.price = calculatePrice(game);
        this.stockQuantity = calculateStockQuantity(game);
        this.inStock = calculateInStock(game);
    }
    
    // Calculate the minimum price from available SteamAccounts
    private BigDecimal calculatePrice(Game game) {
        return game.getSteamAccounts().stream()
                .filter(account -> account.getStatus() == AccountStatus.AVAILABLE && account.getStockQuantity() > 0)
                .map(SteamAccount::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }
    
    // Calculate total stock quantity from all available SteamAccounts
    private Integer calculateStockQuantity(Game game) {
        return game.getSteamAccounts().stream()
                .filter(account -> account.getStatus() == AccountStatus.AVAILABLE)
                .mapToInt(SteamAccount::getStockQuantity)
                .sum();
    }
    
    // Check if game is in stock (has available SteamAccounts)
    private Boolean calculateInStock(Game game) {
        return game.getSteamAccounts().stream()
                .anyMatch(account -> account.getStatus() == AccountStatus.AVAILABLE && account.getStockQuantity() > 0);
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getStockQuantity() {
        return stockQuantity;
    }
    
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
    
    public Boolean getInStock() {
        return inStock;
    }
    
    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }
}

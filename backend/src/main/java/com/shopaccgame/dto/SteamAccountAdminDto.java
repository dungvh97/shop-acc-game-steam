package com.shopaccgame.dto;

import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.entity.Game;
import com.shopaccgame.dto.GameDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

public class SteamAccountAdminDto {
    
    private Long id;
    private String username; // Include username for admin
    private String name;
    private String password; // Decrypted password for admin
    private String activeKey;
    private AccountType accountType;
    private AccountStatus status;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private String imageUrl;
    private Integer stockQuantity;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<Long> gameIds;
    private Set<GameDto> games;
    
    // Constructors
    public SteamAccountAdminDto() {}
    
    public SteamAccountAdminDto(SteamAccount steamAccount) {
        this.id = steamAccount.getId();
        this.username = steamAccount.getUsername();
        this.name = steamAccount.getName();
        this.password = steamAccount.decryptPassword(); // Decrypt password for admin
        this.activeKey = steamAccount.getActiveKey();
        this.accountType = steamAccount.getAccountType();
        this.status = steamAccount.getStatus();
        this.price = steamAccount.getPrice();
        this.originalPrice = steamAccount.getOriginalPrice();
        this.discountPercentage = steamAccount.getDiscountPercentage();
        this.imageUrl = steamAccount.getImageUrl();
        this.stockQuantity = steamAccount.getStockQuantity();
        this.description = steamAccount.getDescription();
        this.createdAt = steamAccount.getCreatedAt();
        this.updatedAt = steamAccount.getUpdatedAt();
        
        if (steamAccount.getGames() != null) {
            this.gameIds = steamAccount.getGames().stream()
                .map(Game::getId)
                .collect(Collectors.toSet());
            
            this.games = steamAccount.getGames().stream()
                .map(GameDto::new)
                .collect(Collectors.toSet());
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getActiveKey() {
        return activeKey;
    }
    
    public void setActiveKey(String activeKey) {
        this.activeKey = activeKey;
    }
    
    public AccountType getAccountType() {
        return accountType;
    }
    
    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
    
    public AccountStatus getStatus() {
        return status;
    }
    
    public void setStatus(AccountStatus status) {
        this.status = status;
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public Set<Long> getGameIds() {
        return gameIds;
    }
    
    public void setGameIds(Set<Long> gameIds) {
        this.gameIds = gameIds;
    }
    
    public Set<GameDto> getGames() {
        return games;
    }
    
    public void setGames(Set<GameDto> games) {
        this.games = games;
    }
}

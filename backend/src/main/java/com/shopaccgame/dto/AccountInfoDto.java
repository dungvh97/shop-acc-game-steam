package com.shopaccgame.dto;

import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountClassification;
import com.shopaccgame.entity.Game;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

public class AccountInfoDto {
    
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private AccountType accountType;
    private BigDecimal price;
    private Integer discountPercentage;
    private BigDecimal originalPrice;
    private LocalDateTime updatedAt;
    private AccountClassification classify;
    private long availableStockCount;
    private Set<Long> gameIds;
    private Set<GameDto> games;
    
    // Constructors
    public AccountInfoDto() {}
    
    public AccountInfoDto(AccountInfo accountInfo) {
        this.id = accountInfo.getId();
        this.name = accountInfo.getName();
        this.description = accountInfo.getDescription();
        this.imageUrl = accountInfo.getImageUrl();
        this.accountType = accountInfo.getAccountType();
        this.price = accountInfo.getPrice();
        this.discountPercentage = accountInfo.getDiscountPercentage();
        this.originalPrice = accountInfo.getOriginalPrice();
        this.updatedAt = accountInfo.getUpdatedAt();
        this.classify = accountInfo.getClassify();
        this.availableStockCount = accountInfo.getAvailableStockCount();
        
        if (accountInfo.getGames() != null) {
            this.gameIds = accountInfo.getGames().stream()
                .map(Game::getId)
                .collect(Collectors.toSet());
            
            this.games = accountInfo.getGames().stream()
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
    
    public AccountType getAccountType() {
        return accountType;
    }
    
    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getDiscountPercentage() {
        return discountPercentage;
    }
    
    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }
    
    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public long getAvailableStockCount() {
        return availableStockCount;
    }
    
    public void setAvailableStockCount(long availableStockCount) {
        this.availableStockCount = availableStockCount;
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
    
    public AccountClassification getClassify() {
        return classify;
    }

    public void setClassify(AccountClassification classify) {
        this.classify = classify;
    }
}

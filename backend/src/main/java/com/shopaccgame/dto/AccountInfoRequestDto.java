package com.shopaccgame.dto;

import com.shopaccgame.entity.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.Set;

public class AccountInfoRequestDto {
    
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;
    
    private String description;
    
    private String imageUrl;
    
    @NotNull(message = "Account type is required")
    private AccountType accountType;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @JsonProperty("price")
    private BigDecimal price;
    
    @JsonProperty("originalPrice")
    private BigDecimal originalPrice;
    
    private Integer discountPercentage;
    
    private Set<Long> gameIds;
    
    // Constructors
    public AccountInfoRequestDto() {}
    
    // Getters and Setters
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
    
    // Handle String input from frontend (Jackson will call this for string values)
    public void setPrice(String priceStr) {
        if (priceStr != null && !priceStr.trim().isEmpty()) {
            this.price = new BigDecimal(priceStr.trim());
        }
    }
    
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }
    
    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
    
    // Handle String input from frontend (Jackson will call this for string values)
    public void setOriginalPrice(String originalPriceStr) {
        if (originalPriceStr != null && !originalPriceStr.trim().isEmpty()) {
            this.originalPrice = new BigDecimal(originalPriceStr.trim());
        }
    }
    
    public Integer getDiscountPercentage() {
        return discountPercentage;
    }
    
    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public Set<Long> getGameIds() {
        return gameIds;
    }
    
    public void setGameIds(Set<Long> gameIds) {
        this.gameIds = gameIds;
    }
}

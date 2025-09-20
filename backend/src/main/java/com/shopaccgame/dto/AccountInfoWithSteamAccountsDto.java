package com.shopaccgame.dto;

import com.shopaccgame.entity.enums.AccountStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public class AccountInfoWithSteamAccountsDto {
    
    // AccountInfo fields
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;
    
    private String description;
    
    private String imageUrl;
    
    @NotNull(message = "Account type is required")
    private String accountType;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @JsonProperty("price")
    private BigDecimal price;
    
    @JsonProperty("originalPrice")
    private BigDecimal originalPrice;
    
    private Integer discountPercentage;
    
    private Set<Long> gameIds;
    
    // SteamAccount fields
    @NotNull(message = "Stock quantity is required")
    @Positive(message = "Stock quantity must be positive")
    private Integer stockQuantity;
    
    private List<SteamAccountData> steamAccounts;
    
    // Nested class for individual steam account data
    public static class SteamAccountData {
        @NotBlank(message = "Account code is required")
        private String accountCode;
        
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        private String username;
        
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
        
        private String steamGuard;
        
        private AccountStatus status;
        
        // Constructors
        public SteamAccountData() {}
        
        // Getters and Setters
        public String getAccountCode() {
            return accountCode;
        }
        
        public void setAccountCode(String accountCode) {
            this.accountCode = accountCode;
        }
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
        
        public String getSteamGuard() {
            return steamGuard;
        }
        
        public void setSteamGuard(String steamGuard) {
            this.steamGuard = steamGuard;
        }
        
        public AccountStatus getStatus() {
            return status;
        }
        
        public void setStatus(AccountStatus status) {
            this.status = status;
        }
    }
    
    // Constructors
    public AccountInfoWithSteamAccountsDto() {}
    
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
    
    public String getAccountType() {
        return accountType;
    }
    
    public void setAccountType(String accountType) {
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
    
    public Integer getStockQuantity() {
        return stockQuantity;
    }
    
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
    
    public List<SteamAccountData> getSteamAccounts() {
        return steamAccounts;
    }
    
    public void setSteamAccounts(List<SteamAccountData> steamAccounts) {
        this.steamAccounts = steamAccounts;
    }
}

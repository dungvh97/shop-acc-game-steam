package com.shopaccgame.dto;

import com.shopaccgame.entity.enums.AccountStockStatus;
import com.shopaccgame.entity.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SteamAccountAdminDto {
    
    private Long id;
    private Long accountInfoId;
    private String accountCode;
    private String username;
    private String password; // decrypted for admin view
    private String steamGuard;
    private AccountStockStatus status;
    private LocalDateTime verifyDate;
    private LocalDateTime updatedAt;

    // From AccountInfo (for admin UI rendering)
    private String name;
    private AccountType accountType;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private String imageUrl;
    private String description;
    private Long stockQuantity; // available stock count
    private List<Long> gameIds;
    
    // Constructors
    public SteamAccountAdminDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getAccountInfoId() {
        return accountInfoId;
    }
    
    public void setAccountInfoId(Long accountInfoId) {
        this.accountInfoId = accountInfoId;
    }
    
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
    
    public AccountStockStatus getStatus() {
        return status;
    }
    
    public void setStatus(AccountStockStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getVerifyDate() {
        return verifyDate;
    }
    
    public void setVerifyDate(LocalDateTime verifyDate) {
        this.verifyDate = verifyDate;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Long stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public List<Long> getGameIds() {
        return gameIds;
    }

    public void setGameIds(List<Long> gameIds) {
        this.gameIds = gameIds;
    }
}
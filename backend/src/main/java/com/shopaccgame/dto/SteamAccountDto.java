package com.shopaccgame.dto;

import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.entity.enums.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class SteamAccountDto {
    
    private Long id;
    private Long accountInfoId;
    private String accountCode;
    private String username;
    private String steamGuard;
    private AccountStatus status;
    private LocalDateTime verifyDate;
    private LocalDateTime updatedAt;
    
    // AccountInfo fields
    private String name;
    private String description;
    private String imageUrl;
    private AccountType accountType;
    private BigDecimal price;
    private Integer discountPercentage;
    private BigDecimal originalPrice;
    
    // Games field
    private List<GameDto> games;
    
    // Stock quantity field
    private Long stockQuantity;
    
    // Constructors
    public SteamAccountDto() {}
    
    public SteamAccountDto(SteamAccount steamAccount) {
        this.id = steamAccount.getId();
        this.accountInfoId = steamAccount.getAccountInfo().getId();
        this.accountCode = steamAccount.getAccountCode();
        this.username = steamAccount.getUsername();
        this.steamGuard = steamAccount.getSteamGuard();
        this.status = steamAccount.getStatus();
        this.verifyDate = steamAccount.getVerifyDate();
        this.updatedAt = steamAccount.getUpdatedAt();
        
        // Set AccountInfo fields
        this.name = steamAccount.getAccountInfo().getName();
        this.description = steamAccount.getAccountInfo().getDescription();
        this.imageUrl = steamAccount.getAccountInfo().getImageUrl();
        this.accountType = steamAccount.getAccountInfo().getAccountType();
        this.price = steamAccount.getAccountInfo().getPrice();
        this.discountPercentage = steamAccount.getAccountInfo().getDiscountPercentage();
        this.originalPrice = steamAccount.getAccountInfo().getOriginalPrice();
        
        // Set games from AccountInfo
        this.games = steamAccount.getAccountInfo().getGames().stream()
            .map(GameDto::new)
            .collect(Collectors.toList());
        
        // Set stock quantity from AccountInfo
        this.stockQuantity = steamAccount.getAccountInfo().getAvailableStockCount();
    }
    
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
    
    // AccountInfo field getters and setters
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
    
    public List<GameDto> getGames() {
        return games;
    }
    
    public void setGames(List<GameDto> games) {
        this.games = games;
    }
    
    public Long getStockQuantity() {
        return stockQuantity;
    }
    
    public void setStockQuantity(Long stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}
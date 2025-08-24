package com.shopaccgame.dto;

import com.shopaccgame.entity.CartItem;
import com.shopaccgame.entity.SteamAccount;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CartItemDto {
    private Long id;
    private Long steamAccountId;
    private String steamAccountName;
    private String steamAccountImageUrl;
    private String steamAccountDescription;
    private BigDecimal unitPrice;
    private Integer quantity;
    private LocalDateTime addedAt;
    
    public CartItemDto() {}
    
    public CartItemDto(CartItem cartItem) {
        this.id = cartItem.getId();
        this.steamAccountId = cartItem.getSteamAccount().getId();
        this.steamAccountName = cartItem.getSteamAccount().getName();
        this.steamAccountImageUrl = cartItem.getSteamAccount().getImageUrl();
        this.steamAccountDescription = cartItem.getSteamAccount().getDescription();
        this.unitPrice = cartItem.getUnitPrice();
        this.quantity = cartItem.getQuantity();
        this.addedAt = cartItem.getAddedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSteamAccountId() {
        return steamAccountId;
    }
    
    public void setSteamAccountId(Long steamAccountId) {
        this.steamAccountId = steamAccountId;
    }
    
    public String getSteamAccountName() {
        return steamAccountName;
    }
    
    public void setSteamAccountName(String steamAccountName) {
        this.steamAccountName = steamAccountName;
    }
    
    public String getSteamAccountImageUrl() {
        return steamAccountImageUrl;
    }
    
    public void setSteamAccountImageUrl(String steamAccountImageUrl) {
        this.steamAccountImageUrl = steamAccountImageUrl;
    }
    
    public String getSteamAccountDescription() {
        return steamAccountDescription;
    }
    
    public void setSteamAccountDescription(String steamAccountDescription) {
        this.steamAccountDescription = steamAccountDescription;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}

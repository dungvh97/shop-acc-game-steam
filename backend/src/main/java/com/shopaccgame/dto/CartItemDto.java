package com.shopaccgame.dto;

import com.shopaccgame.entity.CartItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CartItemDto {
    private Long id;
    private Long accountInfoId;
    private String accountInfoName;
    private String accountInfoImageUrl;
    private String accountInfoDescription;
    private BigDecimal unitPrice;
    private Integer quantity;
    private LocalDateTime addedAt;
    
    public CartItemDto() {}
    
    public CartItemDto(CartItem cartItem) {
        this.id = cartItem.getId();
        this.accountInfoId = cartItem.getAccountInfo().getId();
        this.accountInfoName = cartItem.getAccountInfo().getName();
        this.accountInfoImageUrl = cartItem.getAccountInfo().getImageUrl();
        this.accountInfoDescription = cartItem.getAccountInfo().getDescription();
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
    
    public Long getAccountInfoId() {
        return accountInfoId;
    }
    
    public void setAccountInfoId(Long accountInfoId) {
        this.accountInfoId = accountInfoId;
    }
    
    public String getAccountInfoName() {
        return accountInfoName;
    }
    
    public void setAccountInfoName(String accountInfoName) {
        this.accountInfoName = accountInfoName;
    }
    
    public String getAccountInfoImageUrl() {
        return accountInfoImageUrl;
    }
    
    public void setAccountInfoImageUrl(String accountInfoImageUrl) {
        this.accountInfoImageUrl = accountInfoImageUrl;
    }
    
    public String getAccountInfoDescription() {
        return accountInfoDescription;
    }
    
    public void setAccountInfoDescription(String accountInfoDescription) {
        this.accountInfoDescription = accountInfoDescription;
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

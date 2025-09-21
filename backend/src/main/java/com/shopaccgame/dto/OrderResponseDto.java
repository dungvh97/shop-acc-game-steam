package com.shopaccgame.dto;

import com.shopaccgame.entity.SteamAccountOrder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponseDto {
    
    private Long id;
    private String orderId;
    private Long accountId;
    private String accountName;
    private String accountType;
    private BigDecimal amount;
    private SteamAccountOrder.OrderStatus status;
    private String paymentMethod;
    private String qrCodeUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime paidAt;
    private String accountUsername;
    private String accountPassword;
    private String steamGuard;
    
    public OrderResponseDto() {}
    
    public OrderResponseDto(SteamAccountOrder order) {
        this.id = order.getId();
        this.orderId = order.getOrderId();
        this.accountId = order.getSteamAccount().getAccountInfo().getId();
        this.accountName = order.getSteamAccount().getAccountInfo().getName();
        this.accountType = order.getSteamAccount().getAccountInfo().getAccountType().name();
        this.amount = order.getAmount();
        this.status = order.getStatus();
        this.paymentMethod = order.getPaymentMethod();
        this.qrCodeUrl = order.getQrCodeUrl();
        this.createdAt = order.getCreatedAt();
        this.expiresAt = order.getExpiresAt();
        this.paidAt = order.getPaidAt();
        this.accountUsername = order.getAccountUsername();
        // Return password and Steam Guard only for paid orders
        if (order.getStatus() == SteamAccountOrder.OrderStatus.PAID) {
            this.accountPassword = order.getAccountPassword();
            this.steamGuard = order.getSteamAccount().getSteamGuard();
        } else {
            this.accountPassword = null;
            this.steamGuard = null;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public Long getAccountId() {
        return accountId;
    }
    
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
    
    public String getAccountName() {
        return accountName;
    }
    
    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }
    
    public String getAccountType() {
        return accountType;
    }
    
    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public SteamAccountOrder.OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(SteamAccountOrder.OrderStatus status) {
        this.status = status;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getQrCodeUrl() {
        return qrCodeUrl;
    }
    
    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public String getAccountUsername() {
        return accountUsername;
    }
    
    public void setAccountUsername(String accountUsername) {
        this.accountUsername = accountUsername;
    }
    
    public String getAccountPassword() {
        return accountPassword;
    }
    
    public void setAccountPassword(String accountPassword) {
        this.accountPassword = accountPassword;
    }

    public String getSteamGuard() {
        return steamGuard;
    }

    public void setSteamGuard(String steamGuard) {
        this.steamGuard = steamGuard;
    }
}

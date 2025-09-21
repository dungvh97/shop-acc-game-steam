package com.shopaccgame.dto;

import com.shopaccgame.entity.SteamAccountOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AdminOrderDto {
    
    private Long id;
    private String orderId;
    private String username;
    private String userEmail;
    private String steamAccountUsername;
    private List<String> gameNames;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime deliveredAt;
    private String accountUsername;
    private String accountPassword;
    
    // Constructors
    public AdminOrderDto() {}
    
    public AdminOrderDto(SteamAccountOrder order) {
        this.id = order.getId();
        this.orderId = order.getOrderId();
        this.username = order.getUser() != null ? order.getUser().getUsername() : null;
        this.userEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        this.steamAccountUsername = order.getAccountUsername(); // Now stored directly in order
        this.gameNames = order.getSteamAccount() != null && order.getSteamAccount().getAccountInfo() != null && order.getSteamAccount().getAccountInfo().getGames() != null 
            ? order.getSteamAccount().getAccountInfo().getGames().stream().map(game -> game.getName()).toList() 
            : List.of();
        this.totalAmount = order.getAmount();
        this.status = order.getStatus().name();
        this.paymentMethod = order.getPaymentMethod();
        this.createdAt = order.getCreatedAt();
        this.paidAt = order.getPaidAt();
        this.deliveredAt = order.getStatus() == SteamAccountOrder.OrderStatus.DELIVERED ? order.getCreatedAt() : null;
        this.accountUsername = order.getAccountUsername();
        this.accountPassword = order.getAccountPassword();
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
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public String getSteamAccountUsername() {
        return steamAccountUsername;
    }
    
    public void setSteamAccountUsername(String steamAccountUsername) {
        this.steamAccountUsername = steamAccountUsername;
    }
    
    public List<String> getGameNames() {
        return gameNames;
    }
    
    public void setGameNames(List<String> gameNames) {
        this.gameNames = gameNames;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }
    
    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
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
}

package com.shopaccgame.entity;

import com.shopaccgame.entity.enums.AccountStockStatus;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "steam_account_orders")
public class SteamAccountOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_id", unique = true, nullable = false)
    private String orderId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "steam_account_id", nullable = false)
    private SteamAccount steamAccount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    @Column(name = "payment_method")
    private String paymentMethod = "QR_CODE";
    
    @Column(name = "qr_code_url")
    private String qrCodeUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "account_username")
    private String accountUsername;
    
    @Column(name = "account_password")
    private String accountPassword;

    public enum OrderStatus {
        PENDING,
        PAID,
        DELIVERED,
        EXPIRED,
        CANCELLED
    }
    
    // Constructors
    public SteamAccountOrder() {}
    
    public SteamAccountOrder(SteamAccount steamAccount, User user, BigDecimal amount) {
        this.steamAccount = steamAccount;
        this.user = user;
        this.amount = amount;
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusMinutes(30); // 30 minutes expiry
        // Generate order ID with timestamp format
        this.orderId = generateOrderId();
    }
    

    
    // Business logic methods
    public void markAsPaid() {
        this.status = OrderStatus.PAID;
        this.paidAt = LocalDateTime.now();
        
        // Store account credentials (encryption handled by service layer)
        if (this.steamAccount != null) {
            this.accountUsername = this.steamAccount.getUsername();
            this.accountPassword = this.steamAccount.getPassword();
            // Mark the steam account as sold
            this.steamAccount.setStatus(AccountStockStatus.SOLD);
        }
    }
    
    // Method to mark the steam account as sold (no longer needed since order is directly linked to steam account)
    public void markSteamAccountAsSold() {
        if (this.steamAccount != null && this.steamAccount.getStatus() == AccountStockStatus.IN_STOCK) {
            this.steamAccount.setStatus(AccountStockStatus.SOLD);
        }
    }
    
    public void markAsDelivered() {
        this.status = OrderStatus.DELIVERED;
    }
    
    public void markAsExpired() {
        this.status = OrderStatus.EXPIRED;
    }
    
    public void cancel() {
        this.status = OrderStatus.CANCELLED;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    public boolean canBePaid() {
        return this.status == OrderStatus.PENDING && !isExpired();
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
    
    public SteamAccount getSteamAccount() {
        return steamAccount;
    }
    
    public void setSteamAccount(SteamAccount steamAccount) {
        this.steamAccount = steamAccount;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
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
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
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
    
    // Generate unique order ID with timestamp format
    private String generateOrderId() {
        return "ORD" + System.currentTimeMillis();
    }
    
    // Update order ID with the actual entity ID after persistence (no longer needed)
    public void updateOrderIdWithId() {
        // This method is kept for backward compatibility but no longer needed
        // Order ID is now generated with timestamp format
    }
    
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.expiresAt == null) {
            this.expiresAt = LocalDateTime.now().plusMinutes(30);
        }
        // Generate order ID with timestamp format if not already set
        if (this.orderId == null) {
            this.orderId = generateOrderId();
        }
    }
}

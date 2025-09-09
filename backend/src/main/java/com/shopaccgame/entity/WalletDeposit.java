package com.shopaccgame.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_deposits")
public class WalletDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deposit_id", unique = true, nullable = false)
    private String depositId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

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

    public enum Status {
        PENDING,
        PAID,
        EXPIRED,
        CANCELLED
    }

    public WalletDeposit() {}

    public WalletDeposit(User user, BigDecimal amount, String depositId) {
        this.user = user;
        this.amount = amount;
        this.depositId = depositId;
        this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = this.createdAt.plusMinutes(30);
    }

    public void markAsPaid() {
        this.status = Status.PAID;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsExpired() {
        this.status = Status.EXPIRED;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDepositId() { return depositId; }
    public void setDepositId(String depositId) { this.depositId = depositId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}



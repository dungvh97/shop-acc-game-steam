package com.shopaccgame.entity;

import com.shopaccgame.entity.enums.AccountStockStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "steam_accounts")
public class SteamAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_info_id", nullable = false)
    private AccountInfo accountInfo;
    
    @Column(name = "account_code")
    private String accountCode;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "steam_guard")
    private String steamGuard;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStockStatus status;
    
    @Column(name = "verify_date")
    private LocalDateTime verifyDate;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public SteamAccount() {}
    
    public SteamAccount(AccountInfo accountInfo, String accountCode, String username, String password) {
        this.accountInfo = accountInfo;
        this.accountCode = accountCode;
        this.username = username;
        this.password = password; // Will be encrypted by service
        this.status = AccountStockStatus.IN_STOCK;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public AccountInfo getAccountInfo() {
        return accountInfo;
    }
    
    public void setAccountInfo(AccountInfo accountInfo) {
        this.accountInfo = accountInfo;
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
        // Store password as-is, encryption will be handled by service
        this.password = password;
    }
    
    public void setEncryptedPassword(String encryptedPassword) {
        // For setting already encrypted password (e.g., from database)
        this.password = encryptedPassword;
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
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

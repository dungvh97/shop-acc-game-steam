package com.shopaccgame.dto;

import com.shopaccgame.entity.enums.AccountStockStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SteamAccountRequestDto {
    
    @NotNull(message = "Account info ID is required")
    private Long accountInfoId;
    
    private String accountCode;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    private String steamGuard;
    
    private AccountStockStatus status;
    
    // Constructors
    public SteamAccountRequestDto() {}
    
    // Getters and Setters
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
}
package com.shopaccgame.dto;

import com.shopaccgame.entity.enums.AccountStatus;

public class AdminSteamAccountUpdateRequest {
    private Long accountInfoId; // optional for updates
    private String accountCode;
    private String username;
    private String password; // optional for updates; if null/blank keep existing
    private String steamGuard;
    private AccountStatus status;

    public AdminSteamAccountUpdateRequest() {}

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

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }
}

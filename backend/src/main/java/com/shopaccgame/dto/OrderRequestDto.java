package com.shopaccgame.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OrderRequestDto {
    
    @NotNull(message = "Account Info ID is required")
    @Positive(message = "Account Info ID must be positive")
    private Long accountInfoId;
    
    public OrderRequestDto() {}
    
    public OrderRequestDto(Long accountInfoId) {
        this.accountInfoId = accountInfoId;
    }
    
    public Long getAccountInfoId() {
        return accountInfoId;
    }
    
    public void setAccountInfoId(Long accountInfoId) {
        this.accountInfoId = accountInfoId;
    }
}

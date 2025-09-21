package com.shopaccgame.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OrderRequestDto {
    
    @NotNull(message = "Steam Account ID is required")
    @Positive(message = "Steam Account ID must be positive")
    private Long steamAccountId;
    
    public OrderRequestDto() {}
    
    public OrderRequestDto(Long steamAccountId) {
        this.steamAccountId = steamAccountId;
    }
    
    public Long getSteamAccountId() {
        return steamAccountId;
    }
    
    public void setSteamAccountId(Long steamAccountId) {
        this.steamAccountId = steamAccountId;
    }
}

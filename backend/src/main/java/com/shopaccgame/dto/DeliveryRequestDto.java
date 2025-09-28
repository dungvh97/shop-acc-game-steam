package com.shopaccgame.dto;

import jakarta.validation.constraints.NotBlank;

public class DeliveryRequestDto {
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String steamGuard;
    
    // Constructors
    public DeliveryRequestDto() {}
    
    public DeliveryRequestDto(String username, String password, String steamGuard) {
        this.username = username;
        this.password = password;
        this.steamGuard = steamGuard;
    }
    
    // Getters and Setters
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
}

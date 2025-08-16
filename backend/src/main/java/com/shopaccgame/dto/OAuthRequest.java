package com.shopaccgame.dto;

import com.shopaccgame.entity.User;

public class OAuthRequest {
    
    private String provider; // "GOOGLE" or "FACEBOOK"
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String oauthId;
    
    // Getters and Setters
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    public String getOauthId() {
        return oauthId;
    }
    
    public void setOauthId(String oauthId) {
        this.oauthId = oauthId;
    }
}

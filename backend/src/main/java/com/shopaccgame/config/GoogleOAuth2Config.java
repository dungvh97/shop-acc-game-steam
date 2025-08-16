package com.shopaccgame.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GoogleOAuth2Config {
    
    @Value("${google.oauth2.client-id}")
    private String clientId;
    
    @Value("${google.oauth2.client-secret}")
    private String clientSecret;
    
    public String getClientId() {
        return clientId;
    }
    
    public String getClientSecret() {
        return clientSecret;
    }
}

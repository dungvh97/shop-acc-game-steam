package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;

import java.time.LocalDateTime;

public class GameDto {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private LocalDateTime updatedAt;
    
    // Constructors
    public GameDto() {}

    public GameDto(Game game) {
        this.id = game.getId();
        this.name = game.getName();
        this.description = game.getDescription();
        this.imageUrl = game.getImageUrl();
        this.updatedAt = game.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

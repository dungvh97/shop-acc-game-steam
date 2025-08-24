package com.shopaccgame.dto;

import com.shopaccgame.entity.Game;
import jakarta.validation.constraints.*;

public class GameRequestDto {
    
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    // Constructors
    public GameRequestDto() {}

    // Convert to entity
    public Game toEntity() {
        Game game = new Game();
        game.setName(this.name);
        game.setDescription(this.description);
        game.setImageUrl(this.imageUrl);
        return game;
    }

    // Update existing entity
    public void updateEntity(Game game) {
        if (this.name != null) game.setName(this.name);
        if (this.description != null) game.setDescription(this.description);
        if (this.imageUrl != null) game.setImageUrl(this.imageUrl);
    }

    // Getters and Setters
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
}

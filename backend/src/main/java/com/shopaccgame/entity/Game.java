package com.shopaccgame.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
public class Game {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    @NotBlank(message = "Game name is required")
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column
    private String imageUrl;
    
    @Column
    private String website;
    
    @Column(columnDefinition = "TEXT")
    private String pcRequirements;
    
    @Column
    private Long steamAppId;
    
    @Column
    private LocalDateTime lastSteamImport;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Many-to-Many relationship with SteamAccount
    @ManyToMany(mappedBy = "games", fetch = FetchType.LAZY)
    private java.util.Set<SteamAccount> steamAccounts = new java.util.HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Game() {}
    
    public Game(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getPcRequirements() {
        return pcRequirements;
    }
    
    public void setPcRequirements(String pcRequirements) {
        this.pcRequirements = pcRequirements;
    }
    
    public Long getSteamAppId() {
        return steamAppId;
    }
    
    public void setSteamAppId(Long steamAppId) {
        this.steamAppId = steamAppId;
    }
    
    public LocalDateTime getLastSteamImport() {
        return lastSteamImport;
    }
    
    public void setLastSteamImport(LocalDateTime lastSteamImport) {
        this.lastSteamImport = lastSteamImport;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public java.util.Set<SteamAccount> getSteamAccounts() {
        return steamAccounts;
    }
    
    public void setSteamAccounts(java.util.Set<SteamAccount> steamAccounts) {
        this.steamAccounts = steamAccounts;
    }
    
    @Override
    public String toString() {
        return "Game{" +
                "id=" + id +
                ", createdAt=" + createdAt +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", website='" + website + '\'' +
                ", pcRequirements='" + pcRequirements + '\'' +
                ", steamAppId=" + steamAppId +
                ", lastSteamImport=" + lastSteamImport +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

package com.shopaccgame.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.Index;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "games", indexes = {
    @jakarta.persistence.Index(name = "idx_games_active", columnList = "active"),
    @jakarta.persistence.Index(name = "idx_games_category", columnList = "category"),
    @jakarta.persistence.Index(name = "idx_games_featured", columnList = "featured"),
    @jakarta.persistence.Index(name = "idx_games_rating", columnList = "rating"),
    @jakarta.persistence.Index(name = "idx_games_rawg_id", columnList = "rawg_id"),
    @jakarta.persistence.Index(name = "idx_games_active_category", columnList = "active, category"),
    @jakarta.persistence.Index(name = "idx_games_active_featured", columnList = "active, featured"),
    @jakarta.persistence.Index(name = "idx_games_active_rating", columnList = "active, rating")
})
public class Game {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @NotBlank(message = "Game name is required")
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Price-related fields removed - now calculated from SteamAccount relationships
    // Price, originalPrice, discountPercentage are now derived from steam_accounts.price
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Category is required")
    private Category category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Type is required")
    private Type type;
    
    @Column
    private String imageUrl;
    
    // Stock quantity removed - now calculated from SteamAccount relationships
    // Stock quantity is now derived from steam_accounts.stock_quantity
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private Boolean featured = false;
    
    @Column(precision = 3, scale = 2)
    @DecimalMin(value = "0.0", inclusive = true, message = "Rating must be non-negative")
    @DecimalMax(value = "5.0", inclusive = true, message = "Rating cannot exceed 5.0")
    private BigDecimal rating;
    
    @Column
    private String releaseDate;
    
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    @Column(name = "rawg_id")
    private Long rawgId;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Many-to-Many relationship with SteamAccount
    @ManyToMany(mappedBy = "games", fetch = FetchType.LAZY)
    private Set<SteamAccount> steamAccounts = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum Category {
        GAME_KEY,
        STEAM_ACCOUNT_ONLINE,
        STEAM_ACCOUNT_OFFLINE,
        ENTERTAINMENT_SOFTWARE,
        UTILITY_SOFTWARE
    }
    
    public enum Type {
        STEAM_KEY,
        EPIC_KEY,
        ORIGIN_KEY,
        UPLAY_KEY,
        GOG_KEY,
        OTHER_KEY
    }
    
    // Constructors
    public Game() {}
    
    public Game(String name, String description, Category category, Type type) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.type = type;
        this.active = true;
        this.featured = false;
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
    
    // Title field removed - using name field for display
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    // Price-related getters and setters removed - now calculated from SteamAccount relationships
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public Type getType() {
        return type;
    }
    
    public void setType(Type type) {
        this.type = type;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    // Stock quantity getter and setter removed - now calculated from SteamAccount relationships
    
    public Set<SteamAccount> getSteamAccounts() {
        return steamAccounts;
    }
    
    public void setSteamAccounts(Set<SteamAccount> steamAccounts) {
        this.steamAccounts = steamAccounts;
    }
    
    /**
     * Calculate the minimum price from available SteamAccounts
     * @return Minimum price or null if no accounts available
     */
    public BigDecimal getCalculatedPrice() {
        return steamAccounts.stream()
                .filter(account -> account.getStatus() == SteamAccount.AccountStatus.AVAILABLE && account.getStockQuantity() > 0)
                .map(SteamAccount::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }
    
    /**
     * Calculate total stock quantity from all available SteamAccounts
     * @return Total stock quantity
     */
    public Integer getCalculatedStockQuantity() {
        return steamAccounts.stream()
                .filter(account -> account.getStatus() == SteamAccount.AccountStatus.AVAILABLE)
                .mapToInt(SteamAccount::getStockQuantity)
                .sum();
    }
    
    /**
     * Check if game is in stock (has available SteamAccounts)
     * @return true if in stock, false otherwise
     */
    public boolean isInStock() {
        return steamAccounts.stream()
                .anyMatch(account -> account.getStatus() == SteamAccount.AccountStatus.AVAILABLE && account.getStockQuantity() > 0);
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public Boolean getFeatured() {
        return featured;
    }
    
    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }
    
    public BigDecimal getRating() {
        return rating;
    }
    
    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }
    
    public String getReleaseDate() {
        return releaseDate;
    }
    
    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public Long getRawgId() {
        return rawgId;
    }
    
    public void setRawgId(Long rawgId) {
        this.rawgId = rawgId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "Game{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category=" + category +
                ", type=" + type +
                ", active=" + active +
                ", featured=" + featured +
                '}';
    }
}

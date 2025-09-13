package com.shopaccgame.entity;

import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "steam_accounts")
public class SteamAccount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "steam_guard")
    private String steamGuard;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price;
    
    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;
    
    @Column(name = "discount_percentage")
    private Integer discountPercentage;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0; // Default 0 accounts available
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "verify_date")
    private LocalDateTime verifyDate;
    
    // Many-to-Many relationship with Game
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "account_games",
        joinColumns = @JoinColumn(name = "account_id"),
        inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<Game> games = new HashSet<>();
    
    // Constructors
    public SteamAccount() {}
    
    public SteamAccount(String username, String name, String password, AccountType accountType, BigDecimal price) {
        this.username = username;
        this.name = name;
        this.password = password; // Will be encrypted by service
        this.accountType = accountType;
        this.price = price;
        this.status = AccountStatus.AVAILABLE;
        this.stockQuantity = 0;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        // Store password as-is, encryption will be handled by service
        this.password = password;
    }
    
    public void setEncryptedPassword(String encryptedPassword) {
        // For setting already encrypted password (e.g., from database)
        this.password = encryptedPassword;
    }
    
    public String getSteamGuard() {
        return steamGuard;
    }
    
    public void setSteamGuard(String steamGuard) {
        this.steamGuard = steamGuard;
    }
    
    public AccountType getAccountType() {
        return accountType;
    }
    
    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
    
    public AccountStatus getStatus() {
        return status;
    }
    
    public void setStatus(AccountStatus status) {
        this.status = status;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }
    
    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
    
    public Integer getDiscountPercentage() {
        return discountPercentage;
    }
    
    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Integer getStockQuantity() {
        return stockQuantity;
    }
    
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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

    public LocalDateTime getVerifyDate() {
        return verifyDate;
    }

    public void setVerifyDate(LocalDateTime verifyDate) {
        this.verifyDate = verifyDate;
    }
    
    public Set<Game> getGames() {
        return games;
    }
    
    public void setGames(Set<Game> games) {
        this.games = games;
    }
    
    // Helper methods
    public void addGame(Game game) {
        this.games.add(game);
    }
    
    public void removeGame(Game game) {
        this.games.remove(game);
    }
    
    public void decrementStock() {
        if (this.stockQuantity > 0) {
            this.stockQuantity--;
            if (this.stockQuantity == 0) {
                this.status = AccountStatus.SOLD;
            }
        }
    }
    
    public void incrementStock() {
        this.stockQuantity++;
        if (this.status == AccountStatus.SOLD && this.stockQuantity > 0) {
            this.status = AccountStatus.AVAILABLE;
        }
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

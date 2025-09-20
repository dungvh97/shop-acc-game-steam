package com.shopaccgame.entity;

import com.shopaccgame.entity.enums.AccountType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "account_info")
public class AccountInfo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price;
    
    @Column(name = "discount_percentage")
    private Integer discountPercentage;
    
    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One-to-Many relationship with SteamAccount
    @OneToMany(mappedBy = "accountInfo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<SteamAccount> steamAccounts = new HashSet<>();
    
    // Many-to-Many relationship with Game
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "account_games",
        joinColumns = @JoinColumn(name = "account_info_id"),
        inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<Game> games = new HashSet<>();
    
    // Constructors
    public AccountInfo() {}
    
    public AccountInfo(String name, String description, AccountType accountType, BigDecimal price) {
        this.name = name;
        this.description = description;
        this.accountType = accountType;
        this.price = price;
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
    
    public AccountType getAccountType() {
        return accountType;
    }
    
    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getDiscountPercentage() {
        return discountPercentage;
    }
    
    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }
    
    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Set<SteamAccount> getSteamAccounts() {
        return steamAccounts;
    }
    
    public void setSteamAccounts(Set<SteamAccount> steamAccounts) {
        this.steamAccounts = steamAccounts;
    }
    
    public Set<Game> getGames() {
        return games;
    }
    
    public void setGames(Set<Game> games) {
        this.games = games;
    }
    
    // Helper methods
    public void addSteamAccount(SteamAccount steamAccount) {
        this.steamAccounts.add(steamAccount);
        steamAccount.setAccountInfo(this);
    }
    
    public void removeSteamAccount(SteamAccount steamAccount) {
        this.steamAccounts.remove(steamAccount);
        steamAccount.setAccountInfo(null);
    }
    
    public void addGame(Game game) {
        this.games.add(game);
    }
    
    public void removeGame(Game game) {
        this.games.remove(game);
    }
    
    // Get available stock count
    public long getAvailableStockCount() {
        return steamAccounts.stream()
            .filter(account -> account.getStatus() == com.shopaccgame.entity.enums.AccountStatus.AVAILABLE)
            .count();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

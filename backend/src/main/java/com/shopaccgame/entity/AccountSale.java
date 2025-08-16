package com.shopaccgame.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "account_sales")
public class AccountSale {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private SteamAccount account;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;
    
    @Column(name = "sale_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal salePrice;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status;
    
    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate;
    
    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-Many relationship with Game to track which games were affected
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sale_games",
        joinColumns = @JoinColumn(name = "sale_id"),
        inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private Set<Game> affectedGames = new HashSet<>();
    
    public enum SaleStatus {
        PENDING,
        CONFIRMED,
        DELIVERED,
        CANCELLED,
        REFUNDED
    }
    
    // Constructors
    public AccountSale() {}
    
    public AccountSale(SteamAccount account, User buyer, BigDecimal salePrice) {
        this.account = account;
        this.buyer = buyer;
        this.salePrice = salePrice;
        this.status = SaleStatus.PENDING;
        this.saleDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public SteamAccount getAccount() {
        return account;
    }
    
    public void setAccount(SteamAccount account) {
        this.account = account;
    }
    
    public User getBuyer() {
        return buyer;
    }
    
    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }
    
    public BigDecimal getSalePrice() {
        return salePrice;
    }
    
    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }
    
    public SaleStatus getStatus() {
        return status;
    }
    
    public void setStatus(SaleStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getSaleDate() {
        return saleDate;
    }
    
    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }
    
    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }
    
    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    public Set<Game> getAffectedGames() {
        return affectedGames;
    }
    
    public void setAffectedGames(Set<Game> affectedGames) {
        this.affectedGames = affectedGames;
    }
    
    // Business logic methods
    public void confirmSale() {
        this.status = SaleStatus.CONFIRMED;
        
        // Decrement account stock
        if (this.account != null) {
            this.account.decrementStock();
        }
        
        // Add affected games to tracking set
        if (this.account != null && this.account.getGames() != null) {
            for (Game game : this.account.getGames()) {
                this.affectedGames.add(game);
            }
        }
    }
    
    public void deliver() {
        this.status = SaleStatus.DELIVERED;
        this.deliveryDate = LocalDateTime.now();
    }
    
    public void cancel() {
        this.status = SaleStatus.CANCELLED;
        
        // Restore account stock if it was confirmed
        if (this.account != null) {
            this.account.incrementStock();
        }
        
        // Stock is now managed through SteamAccount relationships
        // No need to manually update game stock quantities
    }
    
    public void refund() {
        this.status = SaleStatus.REFUNDED;
        
        // Restore account stock
        if (this.account != null) {
            this.account.incrementStock();
        }
        
        // Stock is now managed through SteamAccount relationships
        // No need to manually update game stock quantities
    }
    
    public void addAffectedGame(Game game) {
        this.affectedGames.add(game);
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

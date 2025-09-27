package com.shopaccgame.repository;

import com.shopaccgame.entity.SteamAccountOrder;
import com.shopaccgame.entity.User;
import com.shopaccgame.entity.enums.AccountStockStatus;
import com.shopaccgame.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SteamAccountOrderRepository extends JpaRepository<SteamAccountOrder, Long> {
    
    Optional<SteamAccountOrder> findByOrderId(String orderId);
    
    Page<SteamAccountOrder> findByUser(User user, Pageable pageable);
    
    List<SteamAccountOrder> findByUser(User user);
    
    List<SteamAccountOrder> findByStatus(OrderStatus status);
    
    List<SteamAccountOrder> findByUserAndStatus(User user, OrderStatus status);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.status = 'PENDING' AND o.expiresAt < :now")
    List<SteamAccountOrder> findExpiredOrders(@Param("now") LocalDateTime now);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<SteamAccountOrder> findUserOrdersOrderByCreatedAtDesc(@Param("user") User user);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.steamAccount.id = :steamAccountId AND o.status IN ('PENDING', 'PAID')")
    List<SteamAccountOrder> findActiveOrdersBySteamAccountId(@Param("steamAccountId") Long steamAccountId);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.steamAccount.id = :steamAccountId")
    List<SteamAccountOrder> findBySteamAccountId(@Param("steamAccountId") Long steamAccountId);
    
    boolean existsBySteamAccountIdAndStatusIn(Long steamAccountId, List<OrderStatus> statuses);
    
    List<SteamAccountOrder> findByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime start, LocalDateTime end);
    
    List<SteamAccountOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.steamAccount.status = :accountStatus")
    List<SteamAccountOrder> findByAccountStatus(@Param("accountStatus") AccountStockStatus accountStatus);
}

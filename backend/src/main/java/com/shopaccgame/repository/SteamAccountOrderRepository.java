package com.shopaccgame.repository;

import com.shopaccgame.entity.SteamAccountOrder;
import com.shopaccgame.entity.User;
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
    
    List<SteamAccountOrder> findByStatus(SteamAccountOrder.OrderStatus status);
    
    List<SteamAccountOrder> findByUserAndStatus(User user, SteamAccountOrder.OrderStatus status);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.status = 'PENDING' AND o.expiresAt < :now")
    List<SteamAccountOrder> findExpiredOrders(@Param("now") LocalDateTime now);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<SteamAccountOrder> findUserOrdersOrderByCreatedAtDesc(@Param("user") User user);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.account.id = :accountId AND o.status IN ('PENDING', 'PAID')")
    List<SteamAccountOrder> findActiveOrdersByAccountId(@Param("accountId") Long accountId);
    
    @Query("SELECT o FROM SteamAccountOrder o WHERE o.account.id = :accountId")
    List<SteamAccountOrder> findByAccountId(@Param("accountId") Long accountId);
    
    boolean existsByAccountIdAndStatusIn(Long accountId, List<SteamAccountOrder.OrderStatus> statuses);
}

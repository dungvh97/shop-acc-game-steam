package com.shopaccgame.repository;

import com.shopaccgame.entity.CartItem;
import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUserOrderByAddedAtDesc(User user);
    
    Optional<CartItem> findByUserAndAccountInfo(User user, AccountInfo accountInfo);
    
    Optional<CartItem> findByUserAndAccountInfoId(User user, Long accountInfoId);

    Optional<CartItem> findByUserAndSteamAccount(User user, SteamAccount steamAccount);
    
    Optional<CartItem> findByUserAndSteamAccountId(User user, Long steamAccountId);
    
    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.user = :user")
    long countByUser(@Param("user") User user);
    
    void deleteByUser(User user);
    
    void deleteByUserAndAccountInfoId(User user, Long accountInfoId);
    
    void deleteByUserAndSteamAccountId(User user, Long steamAccountId);
}

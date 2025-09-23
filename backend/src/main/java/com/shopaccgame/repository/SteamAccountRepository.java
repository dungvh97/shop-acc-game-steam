package com.shopaccgame.repository;

import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountStockStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SteamAccountRepository extends JpaRepository<SteamAccount, Long> {
    
    Optional<SteamAccount> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    List<SteamAccount> findByStatus(AccountStockStatus status);
    
    List<SteamAccount> findByAccountInfoId(Long accountInfoId);
    
    @Query("SELECT sa FROM SteamAccount sa JOIN FETCH sa.accountInfo ai LEFT JOIN FETCH ai.games WHERE sa.id = :id")
    Optional<SteamAccount> findByIdWithAccountInfo(@Param("id") Long id);
    
    @Query("SELECT sa FROM SteamAccount sa JOIN FETCH sa.accountInfo WHERE sa.status = 'IN_STOCK'")
    List<SteamAccount> findAvailableAccounts();
    
    @Query("SELECT sa FROM SteamAccount sa JOIN FETCH sa.accountInfo ai WHERE ai.accountType = :accountType AND sa.status = 'IN_STOCK'")
    List<SteamAccount> findAvailableAccountsByType(@Param("accountType") com.shopaccgame.entity.enums.AccountType accountType);
    
    @Query("SELECT sa FROM SteamAccount sa JOIN FETCH sa.accountInfo WHERE sa.username LIKE %:searchTerm%")
    Page<SteamAccount> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(sa) FROM SteamAccount sa JOIN sa.accountInfo ai WHERE ai.accountType = :accountType AND sa.status = 'IN_STOCK'")
    long countAvailableByType(@Param("accountType") com.shopaccgame.entity.enums.AccountType accountType);
    
    @Query("SELECT DISTINCT sa FROM SteamAccount sa JOIN FETCH sa.accountInfo ai JOIN ai.games g WHERE g.name LIKE %:gameName% AND sa.status = 'IN_STOCK'")
    List<SteamAccount> findAvailableAccountsByGameName(@Param("gameName") String gameName);
    
    @Query("SELECT DISTINCT sa FROM SteamAccount sa JOIN FETCH sa.accountInfo ai JOIN ai.games g WHERE g.id = :gameId AND sa.status = 'IN_STOCK'")
    List<SteamAccount> findAvailableAccountsByGameId(@Param("gameId") Long gameId);
}

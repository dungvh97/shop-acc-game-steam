package com.shopaccgame.repository;

import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
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
    
    List<SteamAccount> findByAccountType(AccountType accountType);
    
    List<SteamAccount> findByStatus(AccountStatus status);
    
    @Query("SELECT sa FROM SteamAccount sa WHERE sa.stockQuantity > 0")
    List<SteamAccount> findAvailableAccounts();
    
    @Query("SELECT sa FROM SteamAccount sa WHERE sa.accountType = :accountType AND sa.stockQuantity > 0")
    List<SteamAccount> findAvailableAccountsByType(@Param("accountType") AccountType accountType);
    
    Page<SteamAccount> findByAccountType(AccountType accountType, Pageable pageable);
    
    @Query("SELECT sa FROM SteamAccount sa WHERE sa.username LIKE %:searchTerm% OR sa.description LIKE %:searchTerm%")
    Page<SteamAccount> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(sa) FROM SteamAccount sa WHERE sa.accountType = :accountType AND sa.stockQuantity > 0")
    long countAvailableByType(@Param("accountType") AccountType accountType);
    
    @Query("SELECT DISTINCT sa FROM SteamAccount sa JOIN sa.games g WHERE g.name LIKE %:gameName% AND sa.stockQuantity > 0")
    List<SteamAccount> findAvailableAccountsByGameName(@Param("gameName") String gameName);
    
    @Query("SELECT DISTINCT sa FROM SteamAccount sa JOIN sa.games g WHERE g.id = :gameId AND sa.stockQuantity > 0")
    List<SteamAccount> findAvailableAccountsByGameId(@Param("gameId") Long gameId);
}

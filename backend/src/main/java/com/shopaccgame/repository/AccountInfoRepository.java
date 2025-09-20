package com.shopaccgame.repository;

import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.enums.AccountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountInfoRepository extends JpaRepository<AccountInfo, Long> {
    
    List<AccountInfo> findByAccountType(AccountType accountType);
    
    Page<AccountInfo> findByAccountType(AccountType accountType, Pageable pageable);
    
    @Query("SELECT ai FROM AccountInfo ai WHERE ai.name LIKE %:searchTerm% OR ai.description LIKE %:searchTerm%")
    Page<AccountInfo> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT ai FROM AccountInfo ai JOIN ai.steamAccounts sa WHERE sa.status = 'AVAILABLE'")
    List<AccountInfo> findAvailableAccountInfos();
    
    @Query("SELECT ai FROM AccountInfo ai JOIN ai.steamAccounts sa WHERE ai.accountType = :accountType AND sa.status = 'AVAILABLE'")
    List<AccountInfo> findAvailableAccountInfosByType(@Param("accountType") AccountType accountType);
    
    @Query("SELECT COUNT(sa) FROM SteamAccount sa WHERE sa.accountInfo.id = :accountInfoId AND sa.status = 'AVAILABLE'")
    long countAvailableSteamAccountsByAccountInfoId(@Param("accountInfoId") Long accountInfoId);
    
    @Query("SELECT DISTINCT ai FROM AccountInfo ai JOIN ai.games g WHERE g.name LIKE %:gameName%")
    List<AccountInfo> findByGameName(@Param("gameName") String gameName);
}

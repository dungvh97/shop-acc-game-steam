package com.shopaccgame.service;

import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.dto.SteamAccountAdminDto;
import com.shopaccgame.dto.SteamAccountRequestDto;
import com.shopaccgame.entity.Game;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.SteamAccountOrder;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.repository.GameRepository;
import com.shopaccgame.repository.SteamAccountRepository;
import com.shopaccgame.repository.SteamAccountOrderRepository;
import com.shopaccgame.service.EncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class SteamAccountService {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountService.class);
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private GameRepository gameRepository;
    
    @Autowired
    private EncryptionService encryptionService;
    
    @Autowired
    private SteamAccountOrderRepository steamAccountOrderRepository;
    
    public List<SteamAccountDto> getAllSteamAccounts() {
        List<SteamAccount> accounts = steamAccountRepository.findAll();
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public Page<SteamAccountDto> getSteamAccounts(Pageable pageable) {
        Page<SteamAccount> accounts = steamAccountRepository.findAll(pageable);
        return accounts.map(SteamAccountDto::new);
    }
    
    public Page<SteamAccountDto> getSteamAccountsByType(AccountType accountType, Pageable pageable) {
        Page<SteamAccount> accounts = steamAccountRepository.findByAccountType(accountType, pageable);
        return accounts.map(SteamAccountDto::new);
    }
    
    public Page<SteamAccountDto> searchSteamAccounts(String searchTerm, Pageable pageable) {
        Page<SteamAccount> accounts = steamAccountRepository.findBySearchTerm(searchTerm, pageable);
        return accounts.map(SteamAccountDto::new);
    }
    
    public Optional<SteamAccountDto> getSteamAccountById(Long id) {
        return steamAccountRepository.findByIdWithAccountInfo(id)
            .map(SteamAccountDto::new);
    }
    
    // Admin methods that return sensitive information
    public List<SteamAccountAdminDto> getAllSteamAccountsForAdmin() {
        List<SteamAccount> accounts = steamAccountRepository.findAll();
        return accounts.stream()
            .map(this::createAdminDtoWithDecryptedPassword)
            .collect(Collectors.toList());
    }
    
    public Page<SteamAccountAdminDto> getSteamAccountsForAdmin(Pageable pageable) {
        Page<SteamAccount> accounts = steamAccountRepository.findAll(pageable);
        return accounts.map(this::createAdminDtoWithDecryptedPassword);
    }
    
    public Optional<SteamAccountAdminDto> getSteamAccountByIdForAdmin(Long id) {
        return steamAccountRepository.findByIdWithAccountInfo(id)
            .map(this::createAdminDtoWithDecryptedPassword);
    }
    
    public List<SteamAccountDto> getAvailableAccounts() {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccounts();
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public List<SteamAccountDto> getAvailableAccountsByType(AccountType accountType) {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccountsByType(accountType);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    private SteamAccountAdminDto createAdminDtoWithDecryptedPassword(SteamAccount steamAccount) {
        SteamAccountAdminDto dto = new SteamAccountAdminDto(steamAccount);
        try {
            dto.setPassword(encryptionService.decryptPassword(steamAccount.getPassword()));
        } catch (Exception e) {
            logger.warn("Could not decrypt password for account {}: {}", steamAccount.getId(), e.getMessage());
            dto.setPassword("[ENCRYPTED]");
        }
        return dto;
    }
    
    public SteamAccountDto createSteamAccount(SteamAccountRequestDto requestDto) {
        logger.info("Creating new Steam account: {}", requestDto.getUsername());
        // Create new Steam account
        SteamAccount steamAccount = new SteamAccount();
        steamAccount.setUsername(requestDto.getUsername());
        steamAccount.setName(requestDto.getName());
        // Encrypt password before saving
        steamAccount.setPassword(encryptionService.encryptPassword(requestDto.getPassword()));
        steamAccount.setSteamGuard(requestDto.getSteamGuard());
        steamAccount.setAccountType(requestDto.getAccountType());
        steamAccount.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : AccountStatus.AVAILABLE);
        steamAccount.setPrice(requestDto.getPrice());
        steamAccount.setOriginalPrice(requestDto.getOriginalPrice());
        steamAccount.setDiscountPercentage(requestDto.getDiscountPercentage());
        steamAccount.setImageUrl(requestDto.getImageUrl());
        steamAccount.setStockQuantity(requestDto.getStockQuantity());
        steamAccount.setDescription(requestDto.getDescription());
        
        // Associate games if provided
        if (requestDto.getGameIds() != null && !requestDto.getGameIds().isEmpty()) {
            Set<Game> games = new HashSet<>();
            for (Long gameId : requestDto.getGameIds()) {
                Optional<Game> gameOpt = gameRepository.findById(gameId);
                if (gameOpt.isPresent()) {
                    games.add(gameOpt.get());
                } else {
                    logger.warn("Game with ID {} not found, skipping", gameId);
                }
            }
            steamAccount.setGames(games);
        }
        
        SteamAccount savedAccount = steamAccountRepository.save(steamAccount);
        logger.info("Steam account created successfully with ID: {}", savedAccount.getId());
        
        return new SteamAccountDto(savedAccount);
    }
    
    public SteamAccountDto updateSteamAccount(Long id, SteamAccountRequestDto requestDto) {
        logger.info("Updating Steam account with ID: {}", id);
        
        Optional<SteamAccount> existingAccountOpt = steamAccountRepository.findById(id);
        if (existingAccountOpt.isEmpty()) {
            throw new RuntimeException("Steam account not found with ID: " + id);
        }
        
        SteamAccount existingAccount = existingAccountOpt.get();
        
        // Update fields
        existingAccount.setUsername(requestDto.getUsername());
        existingAccount.setName(requestDto.getName());
        if (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty()) {
            existingAccount.setPassword(encryptionService.encryptPassword(requestDto.getPassword()));
        }
        existingAccount.setSteamGuard(requestDto.getSteamGuard());
        existingAccount.setAccountType(requestDto.getAccountType());
        if (requestDto.getStatus() != null) {
            existingAccount.setStatus(requestDto.getStatus());
        }
        existingAccount.setPrice(requestDto.getPrice());
        existingAccount.setOriginalPrice(requestDto.getOriginalPrice());
        existingAccount.setDiscountPercentage(requestDto.getDiscountPercentage());
        existingAccount.setImageUrl(requestDto.getImageUrl());
        existingAccount.setStockQuantity(requestDto.getStockQuantity());
        existingAccount.setDescription(requestDto.getDescription());
        
        // Update associated games if provided
        if (requestDto.getGameIds() != null) {
            Set<Game> games = new HashSet<>();
            for (Long gameId : requestDto.getGameIds()) {
                Optional<Game> gameOpt = gameRepository.findById(gameId);
                if (gameOpt.isPresent()) {
                    games.add(gameOpt.get());
                } else {
                    logger.warn("Game with ID {} not found, skipping", gameId);
                }
            }
            existingAccount.setGames(games);
        }
        
        SteamAccount updatedAccount = steamAccountRepository.save(existingAccount);
        logger.info("Steam account updated successfully with ID: {}", updatedAccount.getId());
        
        return new SteamAccountDto(updatedAccount);
    }
    
    public void deleteSteamAccount(Long id) {
        logger.info("Deleting Steam account with ID: {}", id);
        
        if (!steamAccountRepository.existsById(id)) {
            throw new RuntimeException("Steam account not found with ID: " + id);
        }
        
        // Check if there are any active orders for this account
        List<SteamAccountOrder> activeOrders = steamAccountOrderRepository.findActiveOrdersByAccountId(id);
        if (!activeOrders.isEmpty()) {
            logger.warn("Steam account with ID: {} has {} active orders. Cancelling them before deletion.", id, activeOrders.size());
            
            // Cancel all active orders
            for (SteamAccountOrder order : activeOrders) {
                order.cancel();
                logger.info("Cancelled order {} for account {}", order.getOrderId(), id);
            }
            steamAccountOrderRepository.saveAll(activeOrders);
        }
        
        // Delete all related orders (this should work with CASCADE, but we'll do it manually for safety)
        List<SteamAccountOrder> allOrders = steamAccountOrderRepository.findByAccountId(id);
        if (!allOrders.isEmpty()) {
            logger.info("Deleting {} related orders for Steam account with ID: {}", allOrders.size(), id);
            steamAccountOrderRepository.deleteAll(allOrders);
        }
        
        // Now delete the Steam account
        steamAccountRepository.deleteById(id);
        logger.info("Steam account deleted successfully with ID: {}", id);
    }
    
    public SteamAccountDto updateAccountStatus(Long id, AccountStatus status) {
        logger.info("Updating status for Steam account with ID: {} to {}", id, status);
        
        Optional<SteamAccount> accountOpt = steamAccountRepository.findById(id);
        if (accountOpt.isEmpty()) {
            throw new RuntimeException("Steam account not found with ID: " + id);
        }
        
        SteamAccount account = accountOpt.get();
        account.setStatus(status);
        
        SteamAccount updatedAccount = steamAccountRepository.save(account);
        logger.info("Steam account status updated successfully with ID: {}", updatedAccount.getId());
        
        return new SteamAccountDto(updatedAccount);
    }

    public void updateVerifyDate(Long id, LocalDateTime verifyDate) {
        Optional<SteamAccount> accountOpt = steamAccountRepository.findById(id);
        if (accountOpt.isEmpty()) {
            throw new RuntimeException("Steam account not found with ID: " + id);
        }
        SteamAccount account = accountOpt.get();
        account.setVerifyDate(verifyDate);
        steamAccountRepository.save(account);
    }
    
    public long getAvailableCountByType(AccountType accountType) {
        return steamAccountRepository.countAvailableByType(accountType);
    }
    
    public List<SteamAccountDto> getAccountsByStatus(AccountStatus status) {
        List<SteamAccount> accounts = steamAccountRepository.findByStatus(status);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public List<SteamAccountDto> getAvailableAccountsByGameName(String gameName) {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccountsByGameName(gameName);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public List<SteamAccountDto> getAvailableAccountsByGameId(Long gameId) {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccountsByGameId(gameId);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
}

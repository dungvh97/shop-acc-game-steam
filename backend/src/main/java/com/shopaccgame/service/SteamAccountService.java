package com.shopaccgame.service;

import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.dto.SteamAccountAdminDto;
import com.shopaccgame.dto.SteamAccountRequestDto;
import com.shopaccgame.entity.Game;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.repository.GameRepository;
import com.shopaccgame.repository.SteamAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return steamAccountRepository.findById(id)
            .map(SteamAccountDto::new);
    }
    
    // Admin methods that return sensitive information
    public List<SteamAccountAdminDto> getAllSteamAccountsForAdmin() {
        List<SteamAccount> accounts = steamAccountRepository.findAll();
        return accounts.stream()
            .map(SteamAccountAdminDto::new)
            .collect(Collectors.toList());
    }
    
    public Page<SteamAccountAdminDto> getSteamAccountsForAdmin(Pageable pageable) {
        Page<SteamAccount> accounts = steamAccountRepository.findAll(pageable);
        return accounts.map(SteamAccountAdminDto::new);
    }
    
    public Optional<SteamAccountAdminDto> getSteamAccountByIdForAdmin(Long id) {
        return steamAccountRepository.findById(id)
            .map(SteamAccountAdminDto::new);
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
    
    public SteamAccountDto createSteamAccount(SteamAccountRequestDto requestDto) {
        logger.info("Creating new Steam account: {}", requestDto.getUsername());
        
        // Check if username already exists
        if (steamAccountRepository.existsByUsername(requestDto.getUsername())) {
            throw new RuntimeException("Username already exists: " + requestDto.getUsername());
        }
        
        // Create new Steam account
        SteamAccount steamAccount = new SteamAccount();
        steamAccount.setUsername(requestDto.getUsername());
        steamAccount.setName(requestDto.getName());
        steamAccount.setPassword(requestDto.getPassword());
        steamAccount.setActiveKey(requestDto.getActiveKey());
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
        
        // Check if username is being changed and if it already exists
        if (!existingAccount.getUsername().equals(requestDto.getUsername()) && 
            steamAccountRepository.existsByUsername(requestDto.getUsername())) {
            throw new RuntimeException("Username already exists: " + requestDto.getUsername());
        }
        
        // Update fields
        existingAccount.setUsername(requestDto.getUsername());
        existingAccount.setName(requestDto.getName());
        if (requestDto.getPassword() != null && !requestDto.getPassword().isEmpty()) {
            existingAccount.setPassword(requestDto.getPassword());
        }
        existingAccount.setActiveKey(requestDto.getActiveKey());
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

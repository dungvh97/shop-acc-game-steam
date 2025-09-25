package com.shopaccgame.service;

import com.shopaccgame.dto.AccountInfoDto;
import com.shopaccgame.dto.AccountInfoRequestDto;
import com.shopaccgame.dto.AccountInfoWithSteamAccountsDto;
import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.Game;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountStockStatus;
import com.shopaccgame.entity.enums.AccountClassification;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.repository.AccountInfoRepository;
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
public class AccountInfoService {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountInfoService.class);
    
    @Autowired
    private AccountInfoRepository accountInfoRepository;
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private GameRepository gameRepository;
    
    @Autowired
    private EncryptionService encryptionService;
    
    public List<AccountInfoDto> getAllAccountInfos() {
        List<AccountInfo> accountInfos = accountInfoRepository.findAll();
        return accountInfos.stream()
            .map(AccountInfoDto::new)
            .collect(Collectors.toList());
    }
    
    public Page<AccountInfoDto> getAccountInfos(Pageable pageable) {
        Page<AccountInfo> accountInfos = accountInfoRepository.findAll(pageable);
        return accountInfos.map(AccountInfoDto::new);
    }
    
    public Page<AccountInfoDto> getAccountInfosByType(AccountType accountType, Pageable pageable) {
        Page<AccountInfo> accountInfos = accountInfoRepository.findByAccountType(accountType, pageable);
        return accountInfos.map(AccountInfoDto::new);
    }
    
    public Page<AccountInfoDto> searchAccountInfos(String searchTerm, Pageable pageable) {
        Page<AccountInfo> accountInfos = accountInfoRepository.findBySearchTerm(searchTerm, pageable);
        return accountInfos.map(AccountInfoDto::new);
    }
    
    public Optional<AccountInfoDto> getAccountInfoById(Long id) {
        return accountInfoRepository.findById(id)
            .map(AccountInfoDto::new);
    }
    
    public AccountInfoDto createAccountInfo(AccountInfoRequestDto requestDto) {
        logger.info("Creating new AccountInfo: {}", requestDto.getName());
        
        AccountInfo accountInfo = new AccountInfo();
        accountInfo.setName(requestDto.getName());
        accountInfo.setDescription(requestDto.getDescription());
        accountInfo.setImageUrl(requestDto.getImageUrl());
        accountInfo.setAccountType(requestDto.getAccountType());
        accountInfo.setPrice(requestDto.getPrice());
        accountInfo.setOriginalPrice(requestDto.getOriginalPrice());
        accountInfo.setDiscountPercentage(requestDto.getDiscountPercentage());
        // classify from request (if provided), default to current default
        if (requestDto.getClassify() != null) {
            accountInfo.setClassify(requestDto.getClassify());
        }
        
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
            accountInfo.setGames(games);
        }
        
        AccountInfo savedAccountInfo = accountInfoRepository.save(accountInfo);
        logger.info("AccountInfo created successfully with ID: {}", savedAccountInfo.getId());
        
        return new AccountInfoDto(savedAccountInfo);
    }
    
    public AccountInfoDto createAccountInfoWithSteamAccounts(AccountInfoWithSteamAccountsDto requestDto) {
        logger.info("Creating AccountInfo with SteamAccounts: {}", requestDto.getName());
        
        // Create AccountInfo
        AccountInfo accountInfo = new AccountInfo();
        accountInfo.setName(requestDto.getName());
        accountInfo.setDescription(requestDto.getDescription());
        accountInfo.setImageUrl(requestDto.getImageUrl());
        accountInfo.setAccountType(AccountType.valueOf(requestDto.getAccountType()));
        accountInfo.setPrice(requestDto.getPrice());
        accountInfo.setOriginalPrice(requestDto.getOriginalPrice());
        accountInfo.setDiscountPercentage(requestDto.getDiscountPercentage());
        if (requestDto.getClassify() != null) {
            accountInfo.setClassify(AccountClassification.valueOf(requestDto.getClassify()));
        }
        
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
            accountInfo.setGames(games);
        }
        
        AccountInfo savedAccountInfo = accountInfoRepository.save(accountInfo);
        
        // Create SteamAccounts
        if (requestDto.getSteamAccounts() != null && !requestDto.getSteamAccounts().isEmpty()) {
            for (AccountInfoWithSteamAccountsDto.SteamAccountData steamAccountData : requestDto.getSteamAccounts()) {
                SteamAccount steamAccount = new SteamAccount();
                steamAccount.setAccountInfo(savedAccountInfo);
                steamAccount.setAccountCode(steamAccountData.getAccountCode());
                steamAccount.setUsername(steamAccountData.getUsername());
                steamAccount.setPassword(encryptionService.encryptPassword(steamAccountData.getPassword()));
                steamAccount.setSteamGuard(steamAccountData.getSteamGuard());
                steamAccount.setStatus(steamAccountData.getStatus() != null ? steamAccountData.getStatus() : AccountStockStatus.IN_STOCK);
                
                steamAccountRepository.save(steamAccount);
            }
        }
        
        logger.info("AccountInfo with SteamAccounts created successfully with ID: {}", savedAccountInfo.getId());
        
        return new AccountInfoDto(savedAccountInfo);
    }
    
    public AccountInfoDto updateAccountInfo(Long id, AccountInfoRequestDto requestDto) {
        logger.info("Updating AccountInfo with ID: {}", id);
        
        AccountInfo accountInfo = accountInfoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("AccountInfo not found with id: " + id));
        
        accountInfo.setName(requestDto.getName());
        accountInfo.setDescription(requestDto.getDescription());
        accountInfo.setImageUrl(requestDto.getImageUrl());
        accountInfo.setAccountType(requestDto.getAccountType());
        accountInfo.setPrice(requestDto.getPrice());
        accountInfo.setOriginalPrice(requestDto.getOriginalPrice());
        accountInfo.setDiscountPercentage(requestDto.getDiscountPercentage());
        
        // Update games if provided
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
            accountInfo.setGames(games);
        }
        
        AccountInfo savedAccountInfo = accountInfoRepository.save(accountInfo);
        logger.info("AccountInfo updated successfully with ID: {}", savedAccountInfo.getId());
        
        return new AccountInfoDto(savedAccountInfo);
    }
    
    public void deleteAccountInfo(Long id) {
        logger.info("Deleting AccountInfo with ID: {}", id);
        
        if (!accountInfoRepository.existsById(id)) {
            throw new RuntimeException("AccountInfo not found with id: " + id);
        }
        
        accountInfoRepository.deleteById(id);
        logger.info("AccountInfo deleted successfully with ID: {}", id);
    }
    
    public List<AccountInfoDto> getAvailableAccountInfos() {
        System.out.println("[AccountInfoService] findAvailableAccountInfos executing");
        List<AccountInfo> accountInfos = accountInfoRepository.findAvailableAccountInfos();
        System.out.println("[AccountInfoService] found count=" + (accountInfos != null ? accountInfos.size() : 0));
        return accountInfos.stream()
            .map(AccountInfoDto::new)
            .collect(Collectors.toList());
    }
    
    public List<AccountInfoDto> getAvailableAccountInfosByType(AccountType accountType) {
        System.out.println("[AccountInfoService] findAvailableAccountInfosByType executing accountType=" + accountType);
        List<AccountInfo> accountInfos = accountInfoRepository.findAvailableAccountInfosByType(accountType);
        System.out.println("[AccountInfoService] found count by type=" + (accountInfos != null ? accountInfos.size() : 0));
        return accountInfos.stream()
            .map(AccountInfoDto::new)
            .collect(Collectors.toList());
    }
}

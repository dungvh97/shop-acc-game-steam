package com.shopaccgame.service;

import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.dto.SteamAccountRequestDto;
import com.shopaccgame.dto.SteamAccountAdminDto;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.repository.SteamAccountRepository;
import com.shopaccgame.repository.AccountInfoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SteamAccountServiceNew {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountServiceNew.class);
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private AccountInfoRepository accountInfoRepository;
    
    @Autowired
    private EncryptionService encryptionService;
    
    
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
    
    public List<SteamAccountDto> getSteamAccountsByType(String accountType, Pageable pageable) {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccountsByType(accountType);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
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
    
    public List<SteamAccountAdminDto> getSteamAccountsByTypeForAdmin(String accountType, Pageable pageable) {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccountsByType(accountType);
        return accounts.stream()
            .map(this::createAdminDtoWithDecryptedPassword)
            .collect(Collectors.toList());
    }
    
    public Page<SteamAccountAdminDto> searchSteamAccountsForAdmin(String searchTerm, Pageable pageable) {
        Page<SteamAccount> accounts = steamAccountRepository.findBySearchTerm(searchTerm, pageable);
        return accounts.map(this::createAdminDtoWithDecryptedPassword);
    }
    
    public Optional<SteamAccountAdminDto> getSteamAccountByIdForAdmin(Long id) {
        return steamAccountRepository.findByIdWithAccountInfo(id)
            .map(this::createAdminDtoWithDecryptedPassword);
    }
    
    private SteamAccountAdminDto createAdminDtoWithDecryptedPassword(SteamAccount steamAccount) {
        SteamAccountAdminDto dto = new SteamAccountAdminDto();
        dto.setId(steamAccount.getId());
        dto.setAccountInfoId(steamAccount.getAccountInfo().getId());
        dto.setAccountCode(steamAccount.getAccountCode());
        dto.setUsername(steamAccount.getUsername());
        dto.setPassword(encryptionService.decryptPassword(steamAccount.getPassword()));
        dto.setSteamGuard(steamAccount.getSteamGuard());
        dto.setStatus(steamAccount.getStatus());
        dto.setVerifyDate(steamAccount.getVerifyDate());
        dto.setUpdatedAt(steamAccount.getUpdatedAt());
        return dto;
    }
    
    public SteamAccountDto createSteamAccount(SteamAccountRequestDto requestDto) {
        logger.info("Creating new Steam account: {}", requestDto.getUsername());
        
        AccountInfo accountInfo = accountInfoRepository.findById(requestDto.getAccountInfoId())
            .orElseThrow(() -> new RuntimeException("AccountInfo not found with id: " + requestDto.getAccountInfoId()));
        
        SteamAccount steamAccount = new SteamAccount();
        steamAccount.setAccountInfo(accountInfo);
        steamAccount.setAccountCode(requestDto.getAccountCode());
        steamAccount.setUsername(requestDto.getUsername());
        steamAccount.setPassword(encryptionService.encryptPassword(requestDto.getPassword()));
        steamAccount.setSteamGuard(requestDto.getSteamGuard());
        steamAccount.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : AccountStatus.AVAILABLE);
        
        SteamAccount savedAccount = steamAccountRepository.save(steamAccount);
        logger.info("Steam account created successfully with ID: {}", savedAccount.getId());
        
        return new SteamAccountDto(savedAccount);
    }
    
    public SteamAccountDto updateSteamAccount(Long id, SteamAccountRequestDto requestDto) {
        logger.info("Updating Steam account with ID: {}", id);
        
        SteamAccount steamAccount = steamAccountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("SteamAccount not found with id: " + id));
        
        AccountInfo accountInfo = accountInfoRepository.findById(requestDto.getAccountInfoId())
            .orElseThrow(() -> new RuntimeException("AccountInfo not found with id: " + requestDto.getAccountInfoId()));
        
        steamAccount.setAccountInfo(accountInfo);
        steamAccount.setAccountCode(requestDto.getAccountCode());
        steamAccount.setUsername(requestDto.getUsername());
        steamAccount.setPassword(encryptionService.encryptPassword(requestDto.getPassword()));
        steamAccount.setSteamGuard(requestDto.getSteamGuard());
        steamAccount.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : AccountStatus.AVAILABLE);
        
        SteamAccount savedAccount = steamAccountRepository.save(steamAccount);
        logger.info("Steam account updated successfully with ID: {}", savedAccount.getId());
        
        return new SteamAccountDto(savedAccount);
    }
    
    public void deleteSteamAccount(Long id) {
        logger.info("Deleting Steam account with ID: {}", id);
        
        if (!steamAccountRepository.existsById(id)) {
            throw new RuntimeException("SteamAccount not found with id: " + id);
        }
        
        steamAccountRepository.deleteById(id);
        logger.info("Steam account deleted successfully with ID: {}", id);
    }
    
    public List<SteamAccountDto> getAvailableSteamAccounts() {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccounts();
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public List<SteamAccountDto> getAvailableSteamAccountsByType(String accountType) {
        List<SteamAccount> accounts = steamAccountRepository.findAvailableAccountsByType(accountType);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public List<SteamAccountDto> getSteamAccountsByAccountInfoId(Long accountInfoId) {
        List<SteamAccount> accounts = steamAccountRepository.findByAccountInfoId(accountInfoId);
        return accounts.stream()
            .map(SteamAccountDto::new)
            .collect(Collectors.toList());
    }
    
    public long countAvailableByType(String accountType) {
        return steamAccountRepository.countAvailableByType(accountType);
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

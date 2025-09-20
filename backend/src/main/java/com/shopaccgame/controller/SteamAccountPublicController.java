package com.shopaccgame.controller;

import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.service.SteamAccountServiceNew;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.shopaccgame.service.SteamCheckerService;
import com.shopaccgame.service.SteamCheckerService.ValidationResult;

@RestController
@RequestMapping("/steam-accounts")
@CrossOrigin(origins = "*")
public class SteamAccountPublicController {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountPublicController.class);
    
    @Autowired
    private SteamAccountServiceNew steamAccountService;

    @Autowired
    private SteamCheckerService steamCheckerService;
    
    @GetMapping
    public ResponseEntity<Page<SteamAccountDto>> getAvailableSteamAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Only return available accounts for public access
        List<SteamAccountDto> availableAccounts = steamAccountService.getAvailableSteamAccounts();
        
        // Convert to page format
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), availableAccounts.size());
        
        Page<SteamAccountDto> pageResult;
        if (start < availableAccounts.size()) {
            pageResult = new org.springframework.data.domain.PageImpl<>(
                availableAccounts.subList(start, end), 
                pageable, 
                availableAccounts.size()
            );
        } else {
            pageResult = new org.springframework.data.domain.PageImpl<>(List.of(), pageable, 0);
        }
        
        return ResponseEntity.ok(pageResult);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<SteamAccountDto>> getAllAvailableSteamAccounts() {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableSteamAccounts();
        return ResponseEntity.ok(accounts);
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validateSteamAccount(@PathVariable Long id) {
        long start = System.currentTimeMillis();
        logger.info("[Validate] Received request to validate steam account id={}", id);
        ValidationResult result = steamCheckerService.validateAccountAndUpdate(id);
        long durationMs = System.currentTimeMillis() - start;
        logger.info("[Validate] Completed validation for id={} -> result={} in {} ms", id, result, durationMs);
        return ResponseEntity.ok().body(java.util.Map.of("result", result.name(), "durationMs", durationMs));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SteamAccountDto> getSteamAccountById(@PathVariable Long id) {
        return steamAccountService.getSteamAccountById(id)
            .map(account -> {
                // Return if account is available or pre-order
                if (account.getStatus() == AccountStatus.AVAILABLE || account.getStatus() == AccountStatus.PRE_ORDER) {
                    return account;
                } else {
                    return null;
                }
            })
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/type/{accountType}")
    public ResponseEntity<Page<SteamAccountDto>> getAvailableSteamAccountsByType(
            @PathVariable AccountType accountType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        List<SteamAccountDto> accounts = steamAccountService.getAvailableSteamAccountsByType(accountType.toString());
        
        // Convert to page format
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), accounts.size());
        
        Page<SteamAccountDto> pageResult;
        if (start < accounts.size()) {
            pageResult = new org.springframework.data.domain.PageImpl<>(
                accounts.subList(start, end), 
                pageable, 
                accounts.size()
            );
        } else {
            pageResult = new org.springframework.data.domain.PageImpl<>(List.of(), pageable, 0);
        }
        
        return ResponseEntity.ok(pageResult);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<SteamAccountDto>> searchAvailableSteamAccounts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<SteamAccountDto> accounts = steamAccountService.searchSteamAccounts(q, pageable);
        
        // Filter to show available and pre-order accounts
        List<SteamAccountDto> availableAccounts = accounts.getContent().stream()
            .filter(account -> account.getStatus() == AccountStatus.AVAILABLE || account.getStatus() == AccountStatus.PRE_ORDER)
            .toList();
        
        // Convert to page format
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), availableAccounts.size());
        
        Page<SteamAccountDto> pageResult;
        if (start < availableAccounts.size()) {
            pageResult = new org.springframework.data.domain.PageImpl<>(
                availableAccounts.subList(start, end), 
                pageable, 
                availableAccounts.size()
            );
        } else {
            pageResult = new org.springframework.data.domain.PageImpl<>(List.of(), pageable, 0);
        }
        
        return ResponseEntity.ok(pageResult);
    }
    
    @GetMapping("/search/game")
    public ResponseEntity<Page<SteamAccountDto>> searchAvailableSteamAccountsByGame(
            @RequestParam String gameName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        List<SteamAccountDto> accounts = steamAccountService.getAvailableAccountsByGameName(gameName);
        
        // Convert to page format
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), accounts.size());
        
        Page<SteamAccountDto> pageResult;
        if (start < accounts.size()) {
            pageResult = new org.springframework.data.domain.PageImpl<>(
                accounts.subList(start, end), 
                pageable, 
                accounts.size()
            );
        } else {
            pageResult = new org.springframework.data.domain.PageImpl<>(List.of(), pageable, 0);
        }
        
        return ResponseEntity.ok(pageResult);
    }
    
    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<SteamAccountDto>> getAvailableSteamAccountsByGameId(
            @PathVariable Long gameId) {
        
        List<SteamAccountDto> accounts = steamAccountService.getAvailableAccountsByGameId(gameId);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<SteamAccountDto>> getAvailableAccounts() {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableSteamAccounts();
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/available/{accountType}")
    public ResponseEntity<List<SteamAccountDto>> getAvailableAccountsByType(
            @PathVariable AccountType accountType) {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableSteamAccountsByType(accountType.toString());
        return ResponseEntity.ok(accounts);
    }
}

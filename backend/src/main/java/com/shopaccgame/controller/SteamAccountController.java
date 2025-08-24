package com.shopaccgame.controller;

import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.dto.SteamAccountAdminDto;
import com.shopaccgame.dto.SteamAccountRequestDto;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.service.SteamAccountService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/steam-accounts")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class SteamAccountController {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountController.class);
    
    @Autowired
    private SteamAccountService steamAccountService;
    
    @GetMapping
    public ResponseEntity<Page<SteamAccountDto>> getAllSteamAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<SteamAccountDto> accounts = steamAccountService.getSteamAccounts(pageable);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<SteamAccountDto>> getAllSteamAccountsList() {
        List<SteamAccountDto> accounts = steamAccountService.getAllSteamAccounts();
        return ResponseEntity.ok(accounts);
    }
    
    // Admin endpoints with sensitive information
    @GetMapping("/admin")
    public ResponseEntity<Page<SteamAccountAdminDto>> getAllSteamAccountsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<SteamAccountAdminDto> accounts = steamAccountService.getSteamAccountsForAdmin(pageable);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<SteamAccountAdminDto>> getAllSteamAccountsListForAdmin() {
        List<SteamAccountAdminDto> accounts = steamAccountService.getAllSteamAccountsForAdmin();
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/admin/{id}")
    public ResponseEntity<SteamAccountAdminDto> getSteamAccountByIdForAdmin(@PathVariable Long id) {
        return steamAccountService.getSteamAccountByIdForAdmin(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SteamAccountDto> getSteamAccountById(@PathVariable Long id) {
        return steamAccountService.getSteamAccountById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/type/{accountType}")
    public ResponseEntity<Page<SteamAccountDto>> getSteamAccountsByType(
            @PathVariable AccountType accountType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<SteamAccountDto> accounts = steamAccountService.getSteamAccountsByType(accountType, pageable);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<SteamAccountDto>> searchSteamAccounts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<SteamAccountDto> accounts = steamAccountService.searchSteamAccounts(q, pageable);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<SteamAccountDto>> getAvailableAccounts() {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableAccounts();
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/available/{accountType}")
    public ResponseEntity<List<SteamAccountDto>> getAvailableAccountsByType(
            @PathVariable AccountType accountType) {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableAccountsByType(accountType);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SteamAccountDto>> getAccountsByStatus(
            @PathVariable AccountStatus status) {
        List<SteamAccountDto> accounts = steamAccountService.getAccountsByStatus(status);
        return ResponseEntity.ok(accounts);
    }
    
    @PostMapping
    public ResponseEntity<SteamAccountDto> createSteamAccount(@Valid @RequestBody SteamAccountRequestDto requestDto) {
        try {
            SteamAccountDto createdAccount = steamAccountService.createSteamAccount(requestDto);
            logger.info("Steam account created successfully: {}", createdAccount.getName());
            return ResponseEntity.ok(createdAccount);
        } catch (Exception e) {
            logger.error("Error creating Steam account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SteamAccountDto> updateSteamAccount(
            @PathVariable Long id, 
            @Valid @RequestBody SteamAccountRequestDto requestDto) {
        try {
            SteamAccountDto updatedAccount = steamAccountService.updateSteamAccount(id, requestDto);
            logger.info("Steam account updated successfully: {}", updatedAccount.getName());
            return ResponseEntity.ok(updatedAccount);
        } catch (Exception e) {
            logger.error("Error updating Steam account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<SteamAccountDto> updateAccountStatus(
            @PathVariable Long id, 
            @RequestParam AccountStatus status) {
        try {
            SteamAccountDto updatedAccount = steamAccountService.updateAccountStatus(id, status);
            logger.info("Steam account status updated successfully: {}", updatedAccount.getName());
            return ResponseEntity.ok(updatedAccount);
        } catch (Exception e) {
            logger.error("Error updating Steam account status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSteamAccount(@PathVariable Long id) {
        try {
            steamAccountService.deleteSteamAccount(id);
            logger.info("Steam account deleted successfully with ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting Steam account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSteamAccountStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count available accounts by type
        stats.put("multiGamesAvailable", steamAccountService.getAvailableCountByType(AccountType.MULTI_GAMES));
        stats.put("oneGameAvailable", steamAccountService.getAvailableCountByType(AccountType.ONE_GAME));
        stats.put("discountedAvailable", steamAccountService.getAvailableCountByType(AccountType.DISCOUNTED));
        stats.put("otherAvailable", steamAccountService.getAvailableCountByType(AccountType.OTHER_ACCOUNT));
        
        // Get accounts by status
        stats.put("availableAccounts", steamAccountService.getAccountsByStatus(AccountStatus.AVAILABLE).size());
        stats.put("soldAccounts", steamAccountService.getAccountsByStatus(AccountStatus.SOLD).size());
        stats.put("preOrderAccounts", steamAccountService.getAccountsByStatus(AccountStatus.PRE_ORDER).size());
        stats.put("maintenanceAccounts", steamAccountService.getAccountsByStatus(AccountStatus.MAINTENANCE).size());
        
        return ResponseEntity.ok(stats);
    }
}

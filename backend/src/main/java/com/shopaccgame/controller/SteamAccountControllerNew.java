package com.shopaccgame.controller;

import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.dto.SteamAccountAdminDto;
import com.shopaccgame.dto.SteamAccountRequestDto;
import com.shopaccgame.service.SteamAccountServiceNew;
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
@RequestMapping("/admin/steam-accounts-new")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class SteamAccountControllerNew {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountControllerNew.class);
    
    @Autowired
    private SteamAccountServiceNew steamAccountService;
    
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
    
    @GetMapping("/type/{accountType}")
    public ResponseEntity<List<SteamAccountDto>> getSteamAccountsByType(@PathVariable String accountType) {
        List<SteamAccountDto> accounts = steamAccountService.getSteamAccountsByType(accountType, PageRequest.of(0, 1000));
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/admin/type/{accountType}")
    public ResponseEntity<List<SteamAccountAdminDto>> getSteamAccountsByTypeForAdmin(@PathVariable String accountType) {
        List<SteamAccountAdminDto> accounts = steamAccountService.getSteamAccountsByTypeForAdmin(accountType, PageRequest.of(0, 1000));
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<SteamAccountDto>> searchSteamAccounts(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<SteamAccountDto> accounts = steamAccountService.searchSteamAccounts(searchTerm, pageable);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/admin/search")
    public ResponseEntity<Page<SteamAccountAdminDto>> searchSteamAccountsForAdmin(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<SteamAccountAdminDto> accounts = steamAccountService.searchSteamAccountsForAdmin(searchTerm, pageable);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SteamAccountDto> getSteamAccountById(@PathVariable Long id) {
        return steamAccountService.getSteamAccountById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/admin/{id}")
    public ResponseEntity<SteamAccountAdminDto> getSteamAccountByIdForAdmin(@PathVariable Long id) {
        return steamAccountService.getSteamAccountByIdForAdmin(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<SteamAccountDto> createSteamAccount(@Valid @RequestBody SteamAccountRequestDto requestDto) {
        SteamAccountDto account = steamAccountService.createSteamAccount(requestDto);
        return ResponseEntity.ok(account);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SteamAccountDto> updateSteamAccount(@PathVariable Long id, @Valid @RequestBody SteamAccountRequestDto requestDto) {
        SteamAccountDto account = steamAccountService.updateSteamAccount(id, requestDto);
        return ResponseEntity.ok(account);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSteamAccount(@PathVariable Long id) {
        steamAccountService.deleteSteamAccount(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<SteamAccountDto>> getAvailableSteamAccounts() {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableSteamAccounts();
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/available/type/{accountType}")
    public ResponseEntity<List<SteamAccountDto>> getAvailableSteamAccountsByType(@PathVariable String accountType) {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableSteamAccountsByType(accountType);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/account-info/{accountInfoId}")
    public ResponseEntity<List<SteamAccountDto>> getSteamAccountsByAccountInfoId(@PathVariable Long accountInfoId) {
        List<SteamAccountDto> accounts = steamAccountService.getSteamAccountsByAccountInfoId(accountInfoId);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/stats/type/{accountType}")
    public ResponseEntity<Map<String, Object>> getAccountStatsByType(@PathVariable String accountType) {
        long count = steamAccountService.countAvailableByType(accountType);
        Map<String, Object> stats = new HashMap<>();
        stats.put("accountType", accountType);
        stats.put("availableCount", count);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/available/game/{gameName}")
    public ResponseEntity<List<SteamAccountDto>> getAvailableAccountsByGameName(@PathVariable String gameName) {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableAccountsByGameName(gameName);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/available/game-id/{gameId}")
    public ResponseEntity<List<SteamAccountDto>> getAvailableAccountsByGameId(@PathVariable Long gameId) {
        List<SteamAccountDto> accounts = steamAccountService.getAvailableAccountsByGameId(gameId);
        return ResponseEntity.ok(accounts);
    }
}

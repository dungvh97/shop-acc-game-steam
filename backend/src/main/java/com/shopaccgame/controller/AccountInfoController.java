package com.shopaccgame.controller;

import com.shopaccgame.dto.AccountInfoDto;
import com.shopaccgame.dto.AccountInfoRequestDto;
import com.shopaccgame.dto.AccountInfoWithSteamAccountsDto;
import com.shopaccgame.entity.enums.AccountType;
import com.shopaccgame.service.AccountInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/account-info")
@CrossOrigin(origins = "*")
public class AccountInfoController {
    
    @Autowired
    private AccountInfoService accountInfoService;
    
    @GetMapping
    public ResponseEntity<List<AccountInfoDto>> getAllAccountInfos() {
        List<AccountInfoDto> accountInfos = accountInfoService.getAllAccountInfos();
        return ResponseEntity.ok(accountInfos);
    }
    
    @GetMapping("/page")
    public ResponseEntity<Page<AccountInfoDto>> getAccountInfos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AccountInfoDto> accountInfos = accountInfoService.getAccountInfos(pageable);
        return ResponseEntity.ok(accountInfos);
    }
    
    @GetMapping("/type/{accountType}")
    public ResponseEntity<Page<AccountInfoDto>> getAccountInfosByType(
            @PathVariable AccountType accountType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AccountInfoDto> accountInfos = accountInfoService.getAccountInfosByType(accountType, pageable);
        return ResponseEntity.ok(accountInfos);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<AccountInfoDto>> searchAccountInfos(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AccountInfoDto> accountInfos = accountInfoService.searchAccountInfos(searchTerm, pageable);
        return ResponseEntity.ok(accountInfos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AccountInfoDto> getAccountInfoById(@PathVariable Long id) {
        return accountInfoService.getAccountInfoById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<AccountInfoDto> createAccountInfo(@Valid @RequestBody AccountInfoRequestDto requestDto) {
        AccountInfoDto accountInfo = accountInfoService.createAccountInfo(requestDto);
        return ResponseEntity.ok(accountInfo);
    }
    
    @PostMapping("/with-steam-accounts")
    public ResponseEntity<AccountInfoDto> createAccountInfoWithSteamAccounts(@Valid @RequestBody AccountInfoWithSteamAccountsDto requestDto) {
        AccountInfoDto accountInfo = accountInfoService.createAccountInfoWithSteamAccounts(requestDto);
        return ResponseEntity.ok(accountInfo);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AccountInfoDto> updateAccountInfo(@PathVariable Long id, @Valid @RequestBody AccountInfoRequestDto requestDto) {
        AccountInfoDto accountInfo = accountInfoService.updateAccountInfo(id, requestDto);
        return ResponseEntity.ok(accountInfo);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccountInfo(@PathVariable Long id) {
        accountInfoService.deleteAccountInfo(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<AccountInfoDto>> getAvailableAccountInfos() {
        System.out.println("[AccountInfoController] getAvailableAccountInfos called");
        List<AccountInfoDto> accountInfos = accountInfoService.getAvailableAccountInfos();
        return ResponseEntity.ok(accountInfos);
    }
    
    @GetMapping("/available/type/{accountType}")
    public ResponseEntity<List<AccountInfoDto>> getAvailableAccountInfosByType(@PathVariable AccountType accountType) {
        System.out.println("[AccountInfoController] getAvailableAccountInfosByType called accountType=" + accountType);
        List<AccountInfoDto> accountInfos = accountInfoService.getAvailableAccountInfosByType(accountType);
        return ResponseEntity.ok(accountInfos);
    }
}

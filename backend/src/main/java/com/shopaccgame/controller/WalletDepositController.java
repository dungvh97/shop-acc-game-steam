package com.shopaccgame.controller;

import com.shopaccgame.entity.WalletDeposit;
import com.shopaccgame.service.WalletDepositService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/wallet/deposits")
@CrossOrigin(origins = "*")
public class WalletDepositController {

    @Autowired
    private WalletDepositService depositService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDeposit(@RequestBody Map<String, Object> req, Authentication auth) {
        String username = auth.getName();
        BigDecimal amount = new BigDecimal(String.valueOf(req.get("amount")));
        WalletDeposit deposit = depositService.createDeposit(username, amount);
        Map<String, Object> response = new HashMap<>();
        response.put("depositId", deposit.getDepositId());
        response.put("amount", deposit.getAmount());
        response.put("status", deposit.getStatus());
        response.put("qrCodeUrl", deposit.getQrCodeUrl());
        response.put("createdAt", deposit.getCreatedAt());
        response.put("expiresAt", deposit.getExpiresAt());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{depositId}")
    public ResponseEntity<Map<String, Object>> getDeposit(@PathVariable String depositId, Authentication auth) {
        WalletDeposit deposit = depositService.getByDepositId(depositId);
        Map<String, Object> response = new HashMap<>();
        response.put("depositId", deposit.getDepositId());
        response.put("amount", deposit.getAmount());
        response.put("status", deposit.getStatus());
        response.put("qrCodeUrl", deposit.getQrCodeUrl());
        response.put("createdAt", deposit.getCreatedAt());
        response.put("paidAt", deposit.getPaidAt());
        response.put("expiresAt", deposit.getExpiresAt());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyDeposits(Authentication auth) {
        String username = auth.getName();
        List<WalletDeposit> deposits = depositService.getDepositsForUser(username);
        List<Map<String, Object>> response = deposits.stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("depositId", d.getDepositId());
            m.put("amount", d.getAmount());
            m.put("status", d.getStatus());
            m.put("createdAt", d.getCreatedAt());
            m.put("paidAt", d.getPaidAt());
            m.put("expiresAt", d.getExpiresAt());
            return m;
        }).toList();
        return ResponseEntity.ok(response);
    }
}



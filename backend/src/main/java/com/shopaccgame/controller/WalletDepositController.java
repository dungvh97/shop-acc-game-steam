package com.shopaccgame.controller;

import com.shopaccgame.entity.WalletDeposit;
import com.shopaccgame.service.WalletDepositService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

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
        return ResponseEntity.ok(Map.of(
            "depositId", deposit.getDepositId(),
            "amount", deposit.getAmount(),
            "status", deposit.getStatus(),
            "qrCodeUrl", deposit.getQrCodeUrl(),
            "createdAt", deposit.getCreatedAt(),
            "expiresAt", deposit.getExpiresAt()
        ));
    }

    @GetMapping("/{depositId}")
    public ResponseEntity<Map<String, Object>> getDeposit(@PathVariable String depositId, Authentication auth) {
        WalletDeposit deposit = depositService.getByDepositId(depositId);
        return ResponseEntity.ok(Map.of(
            "depositId", deposit.getDepositId(),
            "amount", deposit.getAmount(),
            "status", deposit.getStatus(),
            "qrCodeUrl", deposit.getQrCodeUrl(),
            "createdAt", deposit.getCreatedAt(),
            "paidAt", deposit.getPaidAt(),
            "expiresAt", deposit.getExpiresAt()
        ));
    }
}



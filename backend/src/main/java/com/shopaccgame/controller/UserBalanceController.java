package com.shopaccgame.controller;

import com.shopaccgame.service.UserBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user/balance")
@CrossOrigin(origins = "*")
public class UserBalanceController {

    @Autowired
    private UserBalanceService userBalanceService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserBalance(Authentication auth) {
        String username = auth.getName();
        BigDecimal balance = userBalanceService.getUserBalance(username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("balance", balance);
        response.put("username", username);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recalculate")
    public ResponseEntity<Map<String, Object>> recalculateBalance(Authentication auth) {
        String username = auth.getName();
        BigDecimal balance = userBalanceService.calculateAndUpdateBalance(username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("balance", balance);
        response.put("username", username);
        response.put("message", "Balance recalculated successfully");
        
        return ResponseEntity.ok(response);
    }
}

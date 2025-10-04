package com.shopaccgame.controller;

import com.shopaccgame.entity.RefundTransaction;
import com.shopaccgame.service.RefundTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user/refunds")
@CrossOrigin(origins = "*")
public class RefundTransactionController {

    @Autowired
    private RefundTransactionService refundTransactionService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyRefunds(Authentication auth) {
        String username = auth.getName();
        List<RefundTransaction> refunds = refundTransactionService.getRefundTransactionsForUser(username);
        
        List<Map<String, Object>> response = refunds.stream().map(refund -> {
            Map<String, Object> refundMap = new HashMap<>();
            refundMap.put("refundId", refund.getRefundId());
            refundMap.put("amount", refund.getAmount());
            refundMap.put("reason", refund.getReason());
            refundMap.put("createdAt", refund.getCreatedAt());
            refundMap.put("processedAt", refund.getProcessedAt());
            refundMap.put("orderId", refund.getOrder().getOrderId());
            refundMap.put("accountName", refund.getOrder().getSteamAccount().getAccountInfo().getName());
            return refundMap;
        }).toList();
        
        return ResponseEntity.ok(response);
    }
}

package com.shopaccgame.controller;

import com.shopaccgame.dto.SepayWebhookDto;
import com.shopaccgame.service.SteamAccountOrderService;
import com.shopaccgame.service.WalletDepositService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/sepay/webhook")
@CrossOrigin(origins = "*")
public class SepayWebhookController {
    
    private static final Logger logger = LoggerFactory.getLogger(SepayWebhookController.class);
    
    @Autowired
    private SteamAccountOrderService orderService;
    @Autowired
    private WalletDepositService walletDepositService;
    
    /**
     * Handle payment webhook from sepay.vn
     * This endpoint receives payment confirmations and updates order status
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> handlePaymentWebhook(@RequestBody SepayWebhookDto webhookData) {
        logger.info("Received payment webhook from sepay.vn: {}", webhookData);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate webhook data
            if (webhookData.getId() == null) {
                logger.error("Invalid webhook data: id is missing");
                response.put("success", false);
                response.put("message", "Invalid webhook data: id is missing");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (webhookData.getTransferType() == null || webhookData.getTransferType().isEmpty()) {
                logger.error("Invalid webhook data: transferType is missing");
                response.put("success", false);
                response.put("message", "Invalid webhook data: transferType is missing");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validate amount if provided
            if (webhookData.getTransferAmount() != null && webhookData.getTransferAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                logger.error("Invalid webhook data: transferAmount must be positive");
                response.put("success", false);
                response.put("message", "Invalid webhook data: transferAmount must be positive");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Extract reference: try code, then content, then referenceCode, then description
            String reference = normalizeNullableString(webhookData.getCode());
            if (reference == null) {
                reference = extractOrderOrDepositFromContent(normalizeNullableString(webhookData.getContent()));
            }
            if (reference == null) {
                reference = extractOrderOrDepositFromContent(normalizeNullableString(webhookData.getReferenceCode()));
            }
            if (reference == null) {
                reference = extractOrderOrDepositFromContent(normalizeNullableString(webhookData.getDescription()));
            }
            
            if (reference == null) {
                logger.error("Invalid webhook data: could not extract reference from any field (code/content/referenceCode/description)");
                response.put("success", false);
                response.put("message", "Invalid webhook data: could not extract reference from code or content");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Only process incoming transactions (money coming in)
            if (!"in".equalsIgnoreCase(webhookData.getTransferType())) {
                logger.info("Ignoring outgoing transaction: {}", webhookData.getId());
                response.put("success", true);
                response.put("message", "Outgoing transaction ignored");
                response.put("transaction_id", webhookData.getId());
                return ResponseEntity.ok(response);
            }
            
            // TODO: Add signature validation for production
            // if (!validateWebhookSignature(webhookData)) {
            //     logger.error("Invalid webhook signature for transaction: {}", webhookData.getId());
            //     response.put("success", false);
            //     response.put("message", "Invalid webhook signature");
            //     return ResponseEntity.badRequest().body(response);
            // }
            
            // Process payment - support orders (ORD...) and deposits (DEP... or DNT...)
            if (reference.startsWith("ORD")) {
                orderService.markOrderAsPaid(reference);
                logger.info("Payment confirmed for order: {} with transaction ID: {}", reference, webhookData.getId());
                response.put("order_id", reference);
                response.put("type", "order");
                response.put("status", "paid");
            } else if (reference.startsWith("DEP") || reference.startsWith("DNT")) {
                walletDepositService.markDepositPaid(reference);
                logger.info("Payment confirmed for deposit: {} with transaction ID: {}", reference, webhookData.getId());
                response.put("deposit_id", reference);
                response.put("type", "deposit");
                response.put("status", "paid");
            } else {
                logger.warn("Unknown reference prefix for webhook: {}", reference);
                response.put("success", false);
                response.put("message", "Unknown reference");
                return ResponseEntity.badRequest().body(response);
            }
            
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("transaction_id", webhookData.getId());
            response.put("amount", webhookData.getTransferAmount());
            response.put("gateway", webhookData.getGateway());
            response.put("reference_code", webhookData.getReferenceCode());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing payment webhook for transaction: {}", 
                webhookData.getId(), e);
            
            response.put("success", false);
            response.put("message", "Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Health check endpoint for webhook
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> webhookHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "sepay-webhook");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Extract order ID from content field using regex pattern
     * Looks for pattern: ORD + timestamp (e.g., ORD17551068389536956)
     */
    private String extractOrderOrDepositFromContent(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }
        
        // Pattern to match ORD or DEP or DNT followed by digits (timestamp)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(ORD|DEP|DNT)\\d+");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        return null;
    }

    private String normalizeNullableString(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;
        if ("null".equalsIgnoreCase(trimmed)) return null;
        return trimmed;
    }
}

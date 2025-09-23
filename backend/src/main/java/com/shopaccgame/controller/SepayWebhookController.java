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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
            
            // Only process incoming transactions (money coming in)
            if (!"in".equalsIgnoreCase(webhookData.getTransferType())) {
                logger.info("Ignoring outgoing transaction: {}", webhookData.getId());
                response.put("success", true);
                response.put("message", "Outgoing transaction ignored");
                response.put("transaction_id", webhookData.getId());
                return ResponseEntity.ok(response);
            }
            
            // Aggregate references from code/content/referenceCode/description
            Set<String> referencesSet = new HashSet<>();
            addAllExtractedReferences(referencesSet, normalizeNullableString(webhookData.getCode()));
            addAllExtractedReferences(referencesSet, normalizeNullableString(webhookData.getContent()));
            addAllExtractedReferences(referencesSet, normalizeNullableString(webhookData.getReferenceCode()));
            addAllExtractedReferences(referencesSet, normalizeNullableString(webhookData.getDescription()));
            List<String> references = new ArrayList<>(referencesSet);
            
            if (references.isEmpty()) {
                logger.error("Invalid webhook data: could not extract reference from any field (code/content/referenceCode/description)");
                response.put("success", false);
                response.put("message", "Invalid webhook data: could not extract reference from code or content");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Process payments - support multiple orders (ORD...) and deposits (DEP... or DNT...)
            List<String> ordersPaid = new ArrayList<>();
            List<String> depositsPaid = new ArrayList<>();
            List<String> unknownReferences = new ArrayList<>();
            for (String ref : references) {
                try {
                    if (ref.startsWith("ORD")) {
                        orderService.markOrderAsPaid(ref);
                        logger.info("Payment confirmed for order: {} with transaction ID: {}", ref, webhookData.getId());
                        ordersPaid.add(ref);
                    } else if (ref.startsWith("DEP") || ref.startsWith("DNT")) {
                        walletDepositService.markDepositPaid(ref);
                        logger.info("Payment confirmed for deposit: {} with transaction ID: {}", ref, webhookData.getId());
                        depositsPaid.add(ref);
                    } else {
                        logger.warn("Unknown reference prefix for webhook: {}", ref);
                        unknownReferences.add(ref);
                    }
                } catch (Exception ex) {
                    logger.error("Failed processing reference {} for transaction {}: {}", ref, webhookData.getId(), ex.getMessage(), ex);
                    unknownReferences.add(ref);
                }
            }
            
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("transaction_id", webhookData.getId());
            response.put("amount", webhookData.getTransferAmount());
            response.put("gateway", webhookData.getGateway());
            response.put("reference_code", webhookData.getReferenceCode());
            response.put("orders_paid", ordersPaid);
            response.put("deposits_paid", depositsPaid);
            if (!unknownReferences.isEmpty()) {
                response.put("unknown_references", unknownReferences);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing payment webhook for transaction: {}", 
                webhookData.getId(), e);
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
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
     * Extract all order/deposit IDs from a content field using regex pattern
     * Looks for tokens like: ORD\d+, DEP\d+, DNT\d+
     */
    private List<String> extractAllOrderOrDepositFromContent(String content) {
        List<String> refs = new ArrayList<>();
        if (content == null || content.isEmpty()) {
            return refs;
        }
        
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(ORD|DEP|DNT)\\d+");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            refs.add(matcher.group());
        }
        return refs;
    }

    private void addAllExtractedReferences(Set<String> accumulator, String content) {
        if (content == null) return;
        List<String> refs = extractAllOrderOrDepositFromContent(content);
        accumulator.addAll(refs);
    }

    private String normalizeNullableString(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;
        if ("null".equalsIgnoreCase(trimmed)) return null;
        return trimmed;
    }
}

package com.shopaccgame.controller;

import com.shopaccgame.dto.SepayWebhookDto;
import com.shopaccgame.service.SteamAccountOrderService;
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
            
            // Extract order ID from the code field or content field
            String orderId = webhookData.getCode();
            if (orderId == null || orderId.isEmpty()) {
                // If code is null, try to extract order ID from content field
                String content = webhookData.getContent();
                if (content != null && !content.isEmpty()) {
                    // Look for order ID pattern (ORD + timestamp) in the content
                    orderId = extractOrderIdFromContent(content);
                }
                
                if (orderId == null || orderId.isEmpty()) {
                    logger.error("Invalid webhook data: could not extract order ID from code or content");
                    response.put("success", false);
                    response.put("message", "Invalid webhook data: could not extract order ID from code or content");
                    return ResponseEntity.badRequest().body(response);
                }
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
            
            // Process payment - mark order as paid
            orderService.markOrderAsPaid(orderId);
            logger.info("Payment confirmed for order: {} with transaction ID: {}", 
                orderId, webhookData.getId());
            
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("order_id", orderId);
            response.put("status", "paid");
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
    private String extractOrderIdFromContent(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }
        
        // Pattern to match ORD followed by digits (timestamp)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("ORD\\d+");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        return null;
    }
}

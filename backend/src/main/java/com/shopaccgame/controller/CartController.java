package com.shopaccgame.controller;

import com.shopaccgame.dto.CartItemDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*")
public class CartController {
    
    @Autowired
    private CartService cartService;
    private static final Logger log = LoggerFactory.getLogger(CartController.class);
    
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }
    
    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addToCart(@RequestBody Map<String, Object> request) {
        try {
            String username = getCurrentUsername();
            Long steamAccountId = Long.valueOf(request.get("steamAccountId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            log.info("Add to cart requested by user={}, steamAccountId={}, quantity={}", username, steamAccountId, quantity);
            
            CartItemDto cartItem = cartService.addToCart(username, steamAccountId, quantity);
            log.info("Added to cart: id={}, steamAccountId={}, accountInfoId={}, accountInfoName={}",
                cartItem.getId(), cartItem.getSteamAccountId(), cartItem.getAccountInfoId(), cartItem.getAccountInfoName());
            return ResponseEntity.ok(cartItem);
        } catch (Exception e) {
            log.error("Add to cart failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/items")
    public ResponseEntity<List<CartItemDto>> getCartItems() {
        try {
            String username = getCurrentUsername();
            log.debug("Fetching cart items for user={}", username);
            List<CartItemDto> cartItems = cartService.getCartItems(username);
            log.debug("Fetched {} cart items for user={}", cartItems.size(), username);
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            log.error("Get cart items failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/remove/{steamAccountId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long steamAccountId) {
        try {
            String username = getCurrentUsername();
            log.info("Remove from cart requested by user={}, steamAccountId={}", username, steamAccountId);
            cartService.removeFromCart(username, steamAccountId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Remove from cart failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/update")
    public ResponseEntity<Void> updateQuantity(@RequestBody Map<String, Object> request) {
        try {
            String username = getCurrentUsername();
            Long steamAccountId = Long.valueOf(request.get("steamAccountId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            log.info("Update quantity requested by user={}, steamAccountId={}, quantity={}", username, steamAccountId, quantity);
            
            cartService.updateQuantity(username, steamAccountId, quantity);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Update quantity failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        try {
            String username = getCurrentUsername();
            log.info("Clear cart requested by user={}", username);
            cartService.clearCart(username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Clear cart failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getCartItemCount() {
        try {
            String username = getCurrentUsername();
            log.debug("Fetching cart item count for user={}", username);
            long count = cartService.getCartItemCount(username);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            log.error("Get cart count failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getCartTotal() {
        try {
            String username = getCurrentUsername();
            log.debug("Fetching cart total for user={}", username);
            BigDecimal total = cartService.getCartTotal(username);
            return ResponseEntity.ok(Map.of("total", total));
        } catch (Exception e) {
            log.error("Get cart total failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<List<OrderResponseDto>> checkoutCart() {
        try {
            String username = getCurrentUsername();
            log.info("Checkout cart requested by user={}", username);
            List<OrderResponseDto> orders = cartService.checkoutCart(username);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Checkout error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/checkout-with-balance")
    public ResponseEntity<List<OrderResponseDto>> checkoutCartWithBalance() {
        try {
            String username = getCurrentUsername();
            log.info("Checkout with balance requested by user={}", username);
            List<OrderResponseDto> orders = cartService.checkoutCartWithBalance(username);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Checkout with balance error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}

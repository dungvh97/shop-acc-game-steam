package com.shopaccgame.controller;

import com.shopaccgame.dto.CartItemDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
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
            
            CartItemDto cartItem = cartService.addToCart(username, steamAccountId, quantity);
            return ResponseEntity.ok(cartItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/items")
    public ResponseEntity<List<CartItemDto>> getCartItems() {
        try {
            String username = getCurrentUsername();
            List<CartItemDto> cartItems = cartService.getCartItems(username);
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/remove/{steamAccountId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long steamAccountId) {
        try {
            String username = getCurrentUsername();
            cartService.removeFromCart(username, steamAccountId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/update")
    public ResponseEntity<Void> updateQuantity(@RequestBody Map<String, Object> request) {
        try {
            String username = getCurrentUsername();
            Long steamAccountId = Long.valueOf(request.get("steamAccountId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            
            cartService.updateQuantity(username, steamAccountId, quantity);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        try {
            String username = getCurrentUsername();
            cartService.clearCart(username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getCartItemCount() {
        try {
            String username = getCurrentUsername();
            long count = cartService.getCartItemCount(username);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getCartTotal() {
        try {
            String username = getCurrentUsername();
            BigDecimal total = cartService.getCartTotal(username);
            return ResponseEntity.ok(Map.of("total", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<List<OrderResponseDto>> checkoutCart() {
        try {
            String username = getCurrentUsername();
            List<OrderResponseDto> orders = cartService.checkoutCart(username);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Checkout error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/checkout-with-balance")
    public ResponseEntity<List<OrderResponseDto>> checkoutCartWithBalance() {
        try {
            String username = getCurrentUsername();
            List<OrderResponseDto> orders = cartService.checkoutCartWithBalance(username);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Checkout with balance error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}

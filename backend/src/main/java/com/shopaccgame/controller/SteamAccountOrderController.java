package com.shopaccgame.controller;

import com.shopaccgame.dto.OrderRequestDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.service.SteamAccountOrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/steam-account-orders")
@CrossOrigin(origins = "*")
public class SteamAccountOrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountOrderController.class);
    
    @Autowired
    private SteamAccountOrderService orderService;
    
    /**
     * Create a new order for a steam account
     */
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody OrderRequestDto requestDto) {
        try {
            String username = getCurrentUsername();
            OrderResponseDto order = orderService.createOrder(requestDto, username);
            
            logger.info("Order created successfully: {} for user: {}", order.getOrderId(), username);
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error creating order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get order by order ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable String orderId) {
        try {
            String username = getCurrentUsername();
            OrderResponseDto order = orderService.getOrderByOrderId(orderId, username);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting order: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get user's orders with pagination
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponseDto>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String username = getCurrentUsername();
            Pageable pageable = PageRequest.of(page, size);
            Page<OrderResponseDto> orders = orderService.getUserOrders(username, pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting user orders: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all user's orders (for profile page)
     */
    @GetMapping("/profile")
    public ResponseEntity<List<OrderResponseDto>> getAllUserOrders() {
        try {
            String username = getCurrentUsername();
            List<OrderResponseDto> orders = orderService.getAllUserOrders(username);
            return ResponseEntity.ok(orders);
        } catch (UsernameNotFoundException e) {
            logger.error("User not found: {}", e.getMessage());
            return ResponseEntity.status(401).build(); // Unauthorized if user not found
        } catch (Exception e) {
            logger.error("Error getting all user orders: {}", e.getMessage());
            // Return empty list instead of error for better UX
            return ResponseEntity.ok(List.of());
        }
    }
    

    
    /**
     * Mark order as delivered
     */
    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<OrderResponseDto> markOrderAsDelivered(@PathVariable String orderId) {
        try {
            String username = getCurrentUsername();
            OrderResponseDto order = orderService.markOrderAsDelivered(orderId, username);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error marking order as delivered: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Cancel order
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(@PathVariable String orderId) {
        try {
            String username = getCurrentUsername();
            OrderResponseDto order = orderService.cancelOrder(orderId, username);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error cancelling order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Check order status (for polling)
     */
    @GetMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> checkOrderStatus(@PathVariable String orderId) {
        try {
            String username = getCurrentUsername();
            OrderResponseDto order = orderService.getOrderByOrderId(orderId, username);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error checking order status: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get current authenticated username
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }
}

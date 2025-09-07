package com.shopaccgame.service;

import com.shopaccgame.dto.CartItemDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.entity.CartItem;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.User;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.repository.CartItemRepository;
import com.shopaccgame.repository.SteamAccountRepository;
import com.shopaccgame.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.shopaccgame.service.SteamAccountOrderService orderService;
    
    @Transactional
    public CartItemDto addToCart(String username, Long steamAccountId, Integer quantity) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        SteamAccount steamAccount = steamAccountRepository.findById(steamAccountId)
            .orElseThrow(() -> new RuntimeException("Steam account not found"));
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByUserAndSteamAccountId(user, steamAccountId)
            .orElse(null);
        
        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setUnitPrice(steamAccount.getPrice());
            existingItem.setAddedAt(LocalDateTime.now());
            CartItem updatedItem = cartItemRepository.save(existingItem);
            return new CartItemDto(updatedItem);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setSteamAccount(steamAccount);
            newItem.setQuantity(quantity);
            newItem.setUnitPrice(steamAccount.getPrice());
            newItem.setAddedAt(LocalDateTime.now());
            
            CartItem savedItem = cartItemRepository.save(newItem);
            return new CartItemDto(savedItem);
        }
    }
    
    public List<CartItemDto> getCartItems(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUserOrderByAddedAtDesc(user);
        return cartItems.stream()
            .map(CartItemDto::new)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void removeFromCart(String username, Long steamAccountId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        cartItemRepository.deleteByUserAndSteamAccountId(user, steamAccountId);
    }
    
    @Transactional
    public void updateQuantity(String username, Long steamAccountId, Integer quantity) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        CartItem cartItem = cartItemRepository.findByUserAndSteamAccountId(user, steamAccountId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
    }
    
    @Transactional
    public void clearCart(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        cartItemRepository.deleteByUser(user);
    }
    
    public long getCartItemCount(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return cartItemRepository.countByUser(user);
    }
    
    public BigDecimal getCartTotal(String username) {
        List<CartItemDto> cartItems = getCartItems(username);
        return cartItems.stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Create orders from all cart items and clear the cart
     */
    @Transactional
    public List<OrderResponseDto> checkoutCart(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUserOrderByAddedAtDesc(user);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Validate all items are still available
        for (CartItem item : cartItems) {
            SteamAccount account = item.getSteamAccount();
            if (account.getStatus() != AccountStatus.AVAILABLE || account.getStockQuantity() <= 0) {
                throw new RuntimeException("Steam account '" + account.getName() + "' is no longer available");
            }
        }
        
        // Create orders for each cart item
        List<OrderResponseDto> orders = new java.util.ArrayList<>();
        for (CartItem item : cartItems) {
            try {
                // Create order request for this item
                com.shopaccgame.dto.OrderRequestDto orderRequest = new com.shopaccgame.dto.OrderRequestDto();
                orderRequest.setAccountId(item.getSteamAccount().getId());
                
                // Create the order
                OrderResponseDto order = orderService.createOrder(orderRequest, username);
                orders.add(order);
            } catch (Exception e) {
                // If any order fails, rollback all orders
                throw new RuntimeException("Failed to create order for account '" + 
                    item.getSteamAccount().getName() + "': " + e.getMessage());
            }
        }
        
        // Clear the cart after successful order creation
        cartItemRepository.deleteByUser(user);
        
        return orders;
    }
}

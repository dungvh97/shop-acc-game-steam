package com.shopaccgame.service;

import com.shopaccgame.dto.CartItemDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.entity.CartItem;
import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.User;
import com.shopaccgame.repository.CartItemRepository;
import com.shopaccgame.repository.AccountInfoRepository;
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
    private AccountInfoRepository accountInfoRepository;
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.shopaccgame.service.SteamAccountOrderService orderService;
    
    @Autowired
    private com.shopaccgame.service.UserBalanceService userBalanceService;
    
    @Transactional
    public CartItemDto addToCart(String username, Long accountInfoId, Integer quantity) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        AccountInfo accountInfo = accountInfoRepository.findById(accountInfoId)
            .orElseThrow(() -> new RuntimeException("Account info not found"));
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByUserAndAccountInfo(user, accountInfo)
            .orElse(null);
        
        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setUnitPrice(accountInfo.getPrice());
            existingItem.setAddedAt(LocalDateTime.now());
            CartItem updatedItem = cartItemRepository.save(existingItem);
            return new CartItemDto(updatedItem);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setAccountInfo(accountInfo);
            newItem.setQuantity(quantity);
            newItem.setUnitPrice(accountInfo.getPrice());
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
    public void removeFromCart(String username, Long accountInfoId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        cartItemRepository.deleteByUserAndAccountInfoId(user, accountInfoId);
    }
    
    @Transactional
    public void updateQuantity(String username, Long accountInfoId, Integer quantity) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        CartItem cartItem = cartItemRepository.findByUserAndAccountInfoId(user, accountInfoId)
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
            AccountInfo accountInfo = item.getAccountInfo();
            if (accountInfo.getAvailableStockCount() <= 0) {
                throw new RuntimeException("Account info '" + accountInfo.getName() + "' is no longer available");
            }
        }
        
        // Create orders for each cart item
        List<OrderResponseDto> orders = new java.util.ArrayList<>();
        for (CartItem item : cartItems) {
            try {
                // Find an available steam account for this account info
                List<com.shopaccgame.entity.SteamAccount> availableAccounts = steamAccountRepository.findByAccountInfoId(item.getAccountInfo().getId())
                    .stream()
                    .filter(account -> account.getStatus() == com.shopaccgame.entity.enums.AccountStatus.AVAILABLE)
                    .toList();
                
                if (availableAccounts.isEmpty()) {
                    throw new RuntimeException("No available steam accounts found for '" + item.getAccountInfo().getName() + "'");
                }
                
                // Create order for each quantity (if quantity > 1, create multiple orders)
                for (int i = 0; i < item.getQuantity(); i++) {
                    if (i >= availableAccounts.size()) {
                        throw new RuntimeException("Not enough available steam accounts for '" + item.getAccountInfo().getName() + "' (requested: " + item.getQuantity() + ", available: " + availableAccounts.size() + ")");
                    }
                    
                    // Create order request for this specific steam account
                    com.shopaccgame.dto.OrderRequestDto orderRequest = new com.shopaccgame.dto.OrderRequestDto();
                    orderRequest.setSteamAccountId(availableAccounts.get(i).getId());
                    
                    // Create the order
                    OrderResponseDto order = orderService.createOrder(orderRequest, username);
                    orders.add(order);
                }
            } catch (Exception e) {
                // If any order fails, rollback all orders
                throw new RuntimeException("Failed to create order for account '" + 
                    item.getAccountInfo().getName() + "': " + e.getMessage());
            }
        }
        
        // Clear the cart after successful order creation
        cartItemRepository.deleteByUser(user);
        
        return orders;
    }
    
    /**
     * Create orders from all cart items, pay with balance, and clear the cart
     */
    @Transactional
    public List<OrderResponseDto> checkoutCartWithBalance(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUserOrderByAddedAtDesc(user);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        // Validate all items are still available
        for (CartItem item : cartItems) {
            AccountInfo accountInfo = item.getAccountInfo();
            if (accountInfo.getAvailableStockCount() <= 0) {
                throw new RuntimeException("Account info '" + accountInfo.getName() + "' is no longer available");
            }
        }
        
        // Calculate total amount needed
        BigDecimal totalAmount = getCartTotal(username);
        
        // Check if user has enough balance
        if (userBalanceService.getUserBalance(username).compareTo(totalAmount) < 0) {
            throw new RuntimeException("Insufficient balance. Required: " + totalAmount + ", Available: " + userBalanceService.getUserBalance(username));
        }
        
        // Create and pay orders for each cart item
        List<OrderResponseDto> orders = new java.util.ArrayList<>();
        for (CartItem item : cartItems) {
            try {
                // Find an available steam account for this account info
                List<com.shopaccgame.entity.SteamAccount> availableAccounts = steamAccountRepository.findByAccountInfoId(item.getAccountInfo().getId())
                    .stream()
                    .filter(account -> account.getStatus() == com.shopaccgame.entity.enums.AccountStatus.AVAILABLE)
                    .toList();
                
                if (availableAccounts.isEmpty()) {
                    throw new RuntimeException("No available steam accounts found for '" + item.getAccountInfo().getName() + "'");
                }
                
                // Create order for each quantity (if quantity > 1, create multiple orders)
                for (int i = 0; i < item.getQuantity(); i++) {
                    if (i >= availableAccounts.size()) {
                        throw new RuntimeException("Not enough available steam accounts for '" + item.getAccountInfo().getName() + "' (requested: " + item.getQuantity() + ", available: " + availableAccounts.size() + ")");
                    }
                    
                    // Create order request for this specific steam account
                    com.shopaccgame.dto.OrderRequestDto orderRequest = new com.shopaccgame.dto.OrderRequestDto();
                    orderRequest.setSteamAccountId(availableAccounts.get(i).getId());
                    
                    // Create and pay the order with balance
                    OrderResponseDto order = orderService.createAndPayWithBalance(orderRequest, username);
                    orders.add(order);
                }
            } catch (Exception e) {
                // If any order fails, rollback all orders
                throw new RuntimeException("Failed to create and pay order for account '" + 
                    item.getAccountInfo().getName() + "': " + e.getMessage());
            }
        }
        
        // Clear the cart after successful order creation and payment
        cartItemRepository.deleteByUser(user);
        
        return orders;
    }
}

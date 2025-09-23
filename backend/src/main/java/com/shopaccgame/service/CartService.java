package com.shopaccgame.service;

import com.shopaccgame.dto.CartItemDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.entity.CartItem;
import com.shopaccgame.entity.AccountInfo;
import com.shopaccgame.entity.User;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.repository.CartItemRepository;
import com.shopaccgame.repository.SteamAccountRepository;
import com.shopaccgame.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    private static final Logger log = LoggerFactory.getLogger(CartService.class);
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.shopaccgame.service.SteamAccountOrderService orderService;
    
    @Autowired
    private com.shopaccgame.service.UserBalanceService userBalanceService;
    
    @Transactional
    public CartItemDto addToCart(String username, Long steamAccountId, Integer quantity) {
        log.info("Adding to cart: user={}, steamAccountId={}, quantity={}", username, steamAccountId, quantity);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        SteamAccount steamAccount = steamAccountRepository.findById(steamAccountId)
            .orElseThrow(() -> new RuntimeException("Steam account not found"));
        AccountInfo accountInfo = steamAccount.getAccountInfo();
        if (accountInfo == null) {
            log.warn("Steam account {} has no linked AccountInfo", steamAccountId);
        }
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByUserAndSteamAccount(user, steamAccount)
            .orElse(null);
        
        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setUnitPrice(accountInfo.getPrice());
            existingItem.setAddedAt(LocalDateTime.now());
            CartItem updatedItem = cartItemRepository.save(existingItem);
            CartItemDto dto = new CartItemDto(updatedItem);
            log.debug("Updated cart item: id={}, accountInfoId={}, accountInfoName={}", dto.getId(), dto.getAccountInfoId(), dto.getAccountInfoName());
            return dto;
        } else {
            // Create new cart item
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setAccountInfo(accountInfo);
            newItem.setSteamAccount(steamAccount);
            newItem.setQuantity(quantity);
            newItem.setUnitPrice(accountInfo.getPrice());
            newItem.setAddedAt(LocalDateTime.now());
            
            CartItem savedItem = cartItemRepository.save(newItem);
            CartItemDto dto = new CartItemDto(savedItem);
            log.debug("Created cart item: id={}, accountInfoId={}, accountInfoName={}", dto.getId(), dto.getAccountInfoId(), dto.getAccountInfoName());
            return dto;
        }
    }
    
    public List<CartItemDto> getCartItems(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUserOrderByAddedAtDesc(user);
        List<CartItemDto> dtos = cartItems.stream()
            .map(CartItemDto::new)
            .collect(Collectors.toList());
        log.debug("Loaded {} cart items for user={}", dtos.size(), username);
        return dtos;
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
                    .filter(account -> account.getStatus() == com.shopaccgame.entity.enums.AccountStockStatus.IN_STOCK)
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
                    .filter(account -> account.getStatus() == com.shopaccgame.entity.enums.AccountStockStatus.IN_STOCK)
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

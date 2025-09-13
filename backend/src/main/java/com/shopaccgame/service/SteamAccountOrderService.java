package com.shopaccgame.service;

import com.shopaccgame.dto.OrderRequestDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.entity.SteamAccountOrder;
import com.shopaccgame.entity.User;
import com.shopaccgame.repository.SteamAccountOrderRepository;
import com.shopaccgame.repository.SteamAccountRepository;
import com.shopaccgame.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SteamAccountOrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(SteamAccountOrderService.class);
    
    @Autowired
    private SteamAccountOrderRepository orderRepository;
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserBalanceService userBalanceService;
    
    /**
     * Create a new order for a steam account
     */
    public OrderResponseDto createOrder(OrderRequestDto requestDto, String username) {
        // Find the user
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Find the steam account
        SteamAccount account = steamAccountRepository.findById(requestDto.getAccountId())
            .orElseThrow(() -> new RuntimeException("Steam account not found"));
        
        // Check if account is available
        if (account.getStatus() != AccountStatus.AVAILABLE || account.getStockQuantity() <= 0) {
            throw new RuntimeException("Steam account is not available for purchase");
        }
        
        // Check if there are any active orders for this account
        List<SteamAccountOrder.OrderStatus> activeStatuses = List.of(
            SteamAccountOrder.OrderStatus.PENDING, 
            SteamAccountOrder.OrderStatus.PAID
        );
        
        if (orderRepository.existsByAccountIdAndStatusIn(account.getId(), activeStatuses)) {
            throw new RuntimeException("Steam account is already being processed in another order");
        }
        
        // Create the order
        SteamAccountOrder order = new SteamAccountOrder(account, user, account.getPrice());
        
        // Generate QR code URL
        String qrCodeUrl = generateQrCodeUrl(order.getOrderId(), order.getAmount());
        order.setQrCodeUrl(qrCodeUrl);
        
        // Save the order
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Created order {} for account {} by user {}", 
            savedOrder.getOrderId(), account.getName(), username);
        
        return new OrderResponseDto(savedOrder);
    }
    
    /**
     * Get order by order ID
     */
    public OrderResponseDto getOrderByOrderId(String orderId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if user owns this order or is admin
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Access denied");
        }
        
        return new OrderResponseDto(order);
    }
    
    /**
     * Get user's orders
     */
    public Page<OrderResponseDto> getUserOrders(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        Page<SteamAccountOrder> orders = orderRepository.findByUser(user, pageable);
        return orders.map(OrderResponseDto::new);
    }
    
    /**
     * Get all user's orders (for profile page)
     */
    public List<OrderResponseDto> getAllUserOrders(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        List<SteamAccountOrder> orders = orderRepository.findUserOrdersOrderByCreatedAtDesc(user);
        return orders.stream().map(OrderResponseDto::new).collect(Collectors.toList());
    }
    
    /**
     * Mark order as paid (simulate payment confirmation)
     */
    public OrderResponseDto markOrderAsPaid(String orderId) {
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.canBePaid()) {
            throw new RuntimeException("Order cannot be paid");
        }
        
        order.markAsPaid();
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Order {} marked as paid", orderId);
        
        return new OrderResponseDto(savedOrder);
    }
    
    /**
     * Mark order as delivered
     */
    public OrderResponseDto markOrderAsDelivered(String orderId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if user owns this order or is admin
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Access denied");
        }
        
        if (order.getStatus() != SteamAccountOrder.OrderStatus.PAID) {
            throw new RuntimeException("Order must be paid before it can be delivered");
        }
        
        order.markAsDelivered();
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Order {} marked as delivered", orderId);
        
        return new OrderResponseDto(savedOrder);
    }
    
    /**
     * Cancel order
     */
    public OrderResponseDto cancelOrder(String orderId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if user owns this order or is admin
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Access denied");
        }
        
        if (order.getStatus() != SteamAccountOrder.OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }
        
        order.cancel();
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Order {} cancelled by user {}", orderId, username);
        
        return new OrderResponseDto(savedOrder);
    }
    
    /**
     * Create and pay order using user balance
     */
    public OrderResponseDto createAndPayWithBalance(OrderRequestDto requestDto, String username) {
        // Find the user
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Find the steam account
        SteamAccount account = steamAccountRepository.findById(requestDto.getAccountId())
            .orElseThrow(() -> new RuntimeException("Steam account not found"));
        
        // Check if account is available
        if (account.getStatus() != AccountStatus.AVAILABLE || account.getStockQuantity() <= 0) {
            throw new RuntimeException("Steam account is not available for purchase");
        }
        
        // Check if there are any active orders for this account
        List<SteamAccountOrder.OrderStatus> activeStatuses = List.of(
            SteamAccountOrder.OrderStatus.PENDING, 
            SteamAccountOrder.OrderStatus.PAID
        );
        
        if (orderRepository.existsByAccountIdAndStatusIn(account.getId(), activeStatuses)) {
            throw new RuntimeException("Steam account is already being processed in another order");
        }
        
        // Check if user has sufficient balance
        if (!userBalanceService.deductFromBalance(username, account.getPrice())) {
            throw new RuntimeException("Insufficient balance");
        }
        
        // Create the order
        SteamAccountOrder order = new SteamAccountOrder(account, user, account.getPrice());
        
        // Mark as paid immediately since we deducted from balance
        order.markAsPaid();
        
        // Generate QR code URL (for reference, though not needed for balance payment)
        String qrCodeUrl = generateQrCodeUrl(order.getOrderId(), order.getAmount());
        order.setQrCodeUrl(qrCodeUrl);
        
        // Save the order
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Created and paid order {} for account {} by user {} using balance", 
            savedOrder.getOrderId(), account.getName(), username);
        
        return new OrderResponseDto(savedOrder);
    }
    
    /**
     * Generate QR code URL for payment
     */
    private String generateQrCodeUrl(String orderId, java.math.BigDecimal amount) {
        return String.format("https://qr.sepay.vn/img?acc=27727998888&bank=TPBank&amount=%s&des=%s", 
            amount.toString(), orderId);
    }
    
    /**
     * Scheduled task to expire old pending orders
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    public void expireOldOrders() {
        List<SteamAccountOrder> expiredOrders = orderRepository.findExpiredOrders(LocalDateTime.now());
        
        for (SteamAccountOrder order : expiredOrders) {
            order.markAsExpired();
            orderRepository.save(order);
            logger.info("Order {} expired automatically", order.getOrderId());
        }
    }
    

}

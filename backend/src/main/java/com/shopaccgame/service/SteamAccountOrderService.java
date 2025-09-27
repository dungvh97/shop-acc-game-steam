package com.shopaccgame.service;

import com.shopaccgame.dto.OrderRequestDto;
import com.shopaccgame.dto.OrderResponseDto;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountClassification;
import com.shopaccgame.entity.enums.AccountStockStatus;
import com.shopaccgame.entity.enums.OrderStatus;
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

    @Autowired
    private EncryptionService encryptionService;
    
    /**
     * Create a new order for a specific steam account
     */
    public OrderResponseDto createOrder(OrderRequestDto requestDto, String username) {
        // Find the user
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Find the steam account
        SteamAccount steamAccount = steamAccountRepository.findById(requestDto.getSteamAccountId())
            .orElseThrow(() -> new RuntimeException("Steam account not found"));
        
        // Check if steam account is available
        if (steamAccount.getStatus() != AccountStockStatus.IN_STOCK && steamAccount.getStatus() != AccountStockStatus.PRE_ORDER) {
            throw new RuntimeException("Steam account is not available for purchase");
        }
        
        // Check if there are any active orders for this specific steam account
        List<OrderStatus> activeStatuses = List.of(
            OrderStatus.PENDING, 
            OrderStatus.PAID
        );
        
        if (orderRepository.existsBySteamAccountIdAndStatusIn(steamAccount.getId(), activeStatuses)) {
            throw new RuntimeException("Steam account is already being processed in another order");
        }
        
        // Create the order
        SteamAccountOrder order = new SteamAccountOrder(steamAccount, user, steamAccount.getAccountInfo().getPrice());
        
        // Generate QR code URL
        String qrCodeUrl = generateQrCodeUrl(order.getOrderId(), order.getAmount());
        order.setQrCodeUrl(qrCodeUrl);
        
        // Save the order
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Created order {} for steam account {} by user {}", 
            savedOrder.getOrderId(), steamAccount.getUsername(), username);
        
        return toOrderResponseDto(savedOrder);
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
        
        return toOrderResponseDto(order);
    }
    
    /**
     * Get user's orders
     */
    public Page<OrderResponseDto> getUserOrders(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        Page<SteamAccountOrder> orders = orderRepository.findByUser(user, pageable);
        return orders.map(this::toOrderResponseDto);
    }
    
    /**
     * Get all user's orders (for profile page)
     */
    public List<OrderResponseDto> getAllUserOrders(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        List<SteamAccountOrder> orders = orderRepository.findUserOrdersOrderByCreatedAtDesc(user);
        return orders.stream().map(this::toOrderResponseDto).collect(Collectors.toList());
    }
    
    /**
     * Mark order as paid (simulate payment confirmation)
     * Case account_info#classify = STOCK, markOrderAsDelivered
     * Setting steamAccount#status
     */
    public OrderResponseDto markOrderAsPaid(String orderId) {
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.canBePaid()) {
            throw new RuntimeException("Order cannot be paid");
        }

        // Handle business for AccountClassification.STOCK and AccountClassification.ORDER
        if (order.getSteamAccount() != null) {
            if (AccountClassification.STOCK.equals(order.getSteamAccount().getAccountInfo().getClassify())) {
                order.markAsDelivered();
                order.getSteamAccount().setStatus(AccountStockStatus.SOLD);
                logger.info("Order {} marked as delivered", orderId);
            } else {
                order.markAsPaid();
                order.getSteamAccount().setStatus(AccountStockStatus.ORDERING);
                logger.info("Order {} marked as paid", orderId);
            }
        }

        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        return toOrderResponseDto(savedOrder);
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
        
        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Order must be paid before it can be delivered");
        }
        
        order.markAsDelivered();
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Order {} marked as delivered", orderId);
        
        return toOrderResponseDto(savedOrder);
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
        
        if (order.getStatus() != OrderStatus.PENDING) {
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
        SteamAccount steamAccount = steamAccountRepository.findById(requestDto.getSteamAccountId())
            .orElseThrow(() -> new RuntimeException("Steam account not found"));
        
        // Check if steam account is available
        if (steamAccount.getStatus() != AccountStockStatus.IN_STOCK && steamAccount.getStatus() != AccountStockStatus.PRE_ORDER) {
            throw new RuntimeException("Steam account is not available for purchase");
        }
        
        // Check if there are any active orders for this steam account
        List<OrderStatus> activeStatuses = List.of(
            OrderStatus.PENDING, 
            OrderStatus.PAID
        );
        
        if (orderRepository.existsBySteamAccountIdAndStatusIn(steamAccount.getId(), activeStatuses)) {
            throw new RuntimeException("Steam account is already being processed in another order");
        }
        
        // Check if user has sufficient balance
        if (!userBalanceService.deductFromBalance(username, steamAccount.getAccountInfo().getPrice())) {
            throw new RuntimeException("Insufficient balance");
        }
        
        // Create the order
        SteamAccountOrder order = new SteamAccountOrder(steamAccount, user, steamAccount.getAccountInfo().getPrice());
        
        // Mark as paid immediately since we deducted from balance
        // Handle business for AccountClassification.STOCK and AccountClassification.ORDER
        if (order.getSteamAccount() != null) {
            if (AccountClassification.STOCK.equals(order.getSteamAccount().getAccountInfo().getClassify())) {
                order.markAsDelivered();
                order.getSteamAccount().setStatus(AccountStockStatus.SOLD);
                logger.info("Order {} marked as delivered", order.getOrderId());
            } else {
                order.markAsPaid();
                order.getSteamAccount().setStatus(AccountStockStatus.ORDERING);
                logger.info("Order {} marked as paid", order.getOrderId());
            }
        }
        
        // Generate QR code URL (for reference, though not needed for balance payment)
        String qrCodeUrl = generateQrCodeUrl(order.getOrderId(), order.getAmount());
        order.setQrCodeUrl(qrCodeUrl);
        
        // Save the order
        SteamAccountOrder savedOrder = orderRepository.save(order);
        
        logger.info("Created and paid order {} for steam account {} by user {} using balance", 
            savedOrder.getOrderId(), steamAccount.getUsername(), username);
        
        return toOrderResponseDto(savedOrder);
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
    
    private OrderResponseDto toOrderResponseDto(SteamAccountOrder order) {
        OrderResponseDto dto = new OrderResponseDto(order);
        if (dto.getAccountPassword() != null) {
            try {
                String decrypted = encryptionService.decryptPassword(dto.getAccountPassword());
                dto.setAccountPassword(decrypted);
            } catch (Exception e) {
                // If decryption fails (legacy plaintext or different scheme), keep original
            }
        }
        return dto;
    }

}

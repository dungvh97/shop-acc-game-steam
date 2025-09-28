package com.shopaccgame.service;

import com.shopaccgame.dto.AdminOrderDto;
import com.shopaccgame.dto.RevenueStatsDto;
import com.shopaccgame.dto.DeliveryRequestDto;
import com.shopaccgame.entity.SteamAccountOrder;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountClassification;
import com.shopaccgame.entity.enums.AccountStockStatus;
import com.shopaccgame.entity.enums.OrderStatus;
import com.shopaccgame.repository.SteamAccountOrderRepository;
import com.shopaccgame.repository.SteamAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    
    @Autowired
    private SteamAccountOrderRepository orderRepository;
    
    @Autowired
    private SteamAccountRepository steamAccountRepository;
    
    /**
     * Get all orders for admin management
     */
    public List<AdminOrderDto> getAllOrders() {
        List<SteamAccountOrder> orders = orderRepository.findAll();
        return orders.stream()
                .map(AdminOrderDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get orders by status (supports both order status and account status)
     */
    public List<AdminOrderDto> getOrdersByStatus(String status) {
        try {
            // First try to parse as order status
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                List<SteamAccountOrder> orders = orderRepository.findByStatus(orderStatus);
                return orders.stream()
                        .map(AdminOrderDto::new)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e1) {
                // If not a valid order status, try as account status
                try {
                    AccountStockStatus accountStatus = AccountStockStatus.valueOf(status.toUpperCase());
                    List<SteamAccountOrder> orders = orderRepository.findByAccountStatus(accountStatus);
                    return orders.stream()
                            .map(AdminOrderDto::new)
                            .collect(Collectors.toList());
                } catch (IllegalArgumentException e2) {
                    logger.error("Invalid status: {} (not a valid order status or account status)", status);
                    throw new RuntimeException("Invalid status: " + status + " (not a valid order status or account status)");
                }
            }
        } catch (Exception e) {
            logger.error("Error getting orders by status {}: {}", status, e.getMessage());
            throw new RuntimeException("Error getting orders by status: " + e.getMessage());
        }
    }
    
    /**
     * Get orders by account classification (ORDER or STOCK)
     */
    public List<AdminOrderDto> getOrdersByClassification(String classification) {
        try {
            AccountClassification accountClassification = AccountClassification.valueOf(classification.toUpperCase());
            List<SteamAccountOrder> orders = orderRepository.findByAccountClassification(accountClassification);
            return orders.stream()
                    .map(AdminOrderDto::new)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            logger.error("Invalid classification: {} (not a valid account classification)", classification);
            throw new RuntimeException("Invalid classification: " + classification + " (valid values: ORDER, STOCK)");
        } catch (Exception e) {
            logger.error("Error getting orders by classification {}: {}", classification, e.getMessage());
            throw new RuntimeException("Error getting orders by classification: " + e.getMessage());
        }
    }
    
    /**
     * Get order by ID
     */
    public AdminOrderDto getOrderById(String orderId) {
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        return new AdminOrderDto(order);
    }
    
    /**
     * Mark order as delivered
     */
    public void markOrderAsDelivered(String orderId) {
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Order must be paid before marking as delivered");
        }
        
        order.markAsDelivered();
        orderRepository.save(order);
        logger.info("Order {} marked as delivered", orderId);
    }
    
    /**
     * Mark order as delivered with Steam account details
     */
    public void markOrderAsDeliveredWithAccount(String orderId, DeliveryRequestDto deliveryRequest) {
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Order must be paid before marking as delivered");
        }
        
        // Get the associated Steam account
        SteamAccount steamAccount = order.getSteamAccount();
        if (steamAccount == null) {
            throw new RuntimeException("No Steam account associated with this order");
        }
        
        // Update Steam account details
        steamAccount.setUsername(deliveryRequest.getUsername());
        steamAccount.setPassword(deliveryRequest.getPassword());
        steamAccount.setSteamGuard(deliveryRequest.getSteamGuard());
        steamAccount.setStatus(AccountStockStatus.DELIVERED);
        
        // Save Steam account
        steamAccountRepository.save(steamAccount);
        
        // Mark order as delivered
        order.markAsDelivered();
        orderRepository.save(order);
        
        logger.info("Order {} marked as delivered with Steam account details: username={}", 
                   orderId, deliveryRequest.getUsername());
    }
    
    /**
     * Cancel order
     */
    public void cancelOrder(String orderId) {
        SteamAccountOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel delivered order");
        }
        
        order.cancel();
        orderRepository.save(order);
        logger.info("Order {} cancelled", orderId);
    }
    
    /**
     * Get revenue statistics
     */
    public RevenueStatsDto getRevenueStats(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();
        
        List<SteamAccountOrder> deliveredOrders = orderRepository.findByStatusAndCreatedAtBetween(
                OrderStatus.DELIVERED, start, end);
        
        BigDecimal totalRevenue = deliveredOrders.stream()
                .map(SteamAccountOrder::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Long totalOrders = (long) deliveredOrders.size();
        BigDecimal averageOrderValue = totalOrders > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        
        // Calculate monthly growth
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate previousMonth = currentMonth.minusMonths(1);
        
        BigDecimal currentMonthRevenue = getMonthlyRevenueAmount(currentMonth, currentMonth.plusMonths(1).minusDays(1));
        BigDecimal previousMonthRevenue = getMonthlyRevenueAmount(previousMonth, currentMonth.minusDays(1));
        
        BigDecimal monthlyGrowth = BigDecimal.ZERO;
        if (previousMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            monthlyGrowth = currentMonthRevenue.subtract(previousMonthRevenue)
                    .divide(previousMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        
        List<RevenueStatsDto.MonthlyRevenue> monthlyRevenue = getMonthlyRevenue(startDate, endDate);
        
        return new RevenueStatsDto(totalRevenue, totalOrders, averageOrderValue, monthlyGrowth, monthlyRevenue);
    }
    
    /**
     * Get monthly revenue data
     */
    public List<RevenueStatsDto.MonthlyRevenue> getMonthlyRevenue(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();
        
        List<SteamAccountOrder> deliveredOrders = orderRepository.findByStatusAndCreatedAtBetween(
                OrderStatus.DELIVERED, start, end);
        
        Map<String, List<SteamAccountOrder>> ordersByMonth = deliveredOrders.stream()
                .collect(Collectors.groupingBy(order -> 
                        order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));
        
        return ordersByMonth.entrySet().stream()
                .map(entry -> {
                    String month = entry.getKey();
                    List<SteamAccountOrder> monthOrders = entry.getValue();
                    BigDecimal total = monthOrders.stream()
                            .map(SteamAccountOrder::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Long count = (long) monthOrders.size();
                    return new RevenueStatsDto.MonthlyRevenue(month, total, count);
                })
                .sorted((a, b) -> b.getMonth().compareTo(a.getMonth()))
                .collect(Collectors.toList());
    }
    
    /**
     * Helper method to get revenue for a specific month
     */
    private BigDecimal getMonthlyRevenueAmount(LocalDate monthStart, LocalDate monthEnd) {
        LocalDateTime start = monthStart.atStartOfDay();
        LocalDateTime end = monthEnd.atTime(23, 59, 59);
        
        List<SteamAccountOrder> orders = orderRepository.findByStatusAndCreatedAtBetween(
                OrderStatus.DELIVERED, start, end);
        
        return orders.stream()
                .map(SteamAccountOrder::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

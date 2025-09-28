package com.shopaccgame.controller;

import com.shopaccgame.dto.AdminOrderDto;
import com.shopaccgame.dto.RevenueStatsDto;
import com.shopaccgame.dto.SteamAccountAdminDto;
import com.shopaccgame.dto.AdminSteamAccountUpdateRequest;
import com.shopaccgame.dto.SteamAccountRequestDto;
import com.shopaccgame.dto.SteamAccountDto;
import com.shopaccgame.entity.enums.AccountStockStatus;

import com.shopaccgame.service.AdminService;
import com.shopaccgame.service.SteamAccountServiceNew;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private SteamAccountServiceNew steamAccountService;
    
    /**
     * Get all orders for admin management
     */
    @GetMapping("/orders")
    public ResponseEntity<List<AdminOrderDto>> getAllOrders() {
        try {
            List<AdminOrderDto> orders = adminService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting all orders: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get orders by status
     */
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<AdminOrderDto>> getOrdersByStatus(@PathVariable String status) {
        try {
            List<AdminOrderDto> orders = adminService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders by status {}: {}", status, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get orders by account classification (ORDER or STOCK)
     */
    @GetMapping("/orders/classification/{classification}")
    public ResponseEntity<List<AdminOrderDto>> getOrdersByClassification(@PathVariable String classification) {
        try {
            List<AdminOrderDto> orders = adminService.getOrdersByClassification(classification);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error getting orders by classification {}: {}", classification, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get order by ID for admin
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<AdminOrderDto> getOrderById(@PathVariable String orderId) {
        try {
            AdminOrderDto order = adminService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            logger.error("Error getting order by ID {}: {}", orderId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Mark order as delivered
     */
    @PostMapping("/orders/{orderId}/deliver")
    public ResponseEntity<String> markOrderAsDelivered(@PathVariable String orderId) {
        try {
            adminService.markOrderAsDelivered(orderId);
            logger.info("Order {} marked as delivered", orderId);
            return ResponseEntity.ok("Order marked as delivered successfully");
        } catch (Exception e) {
            logger.error("Error marking order {} as delivered: {}", orderId, e.getMessage());
            return ResponseEntity.badRequest().body("Error marking order as delivered: " + e.getMessage());
        }
    }
    
    /**
     * Cancel order
     */
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable String orderId) {
        try {
            adminService.cancelOrder(orderId);
            logger.info("Order {} cancelled", orderId);
            return ResponseEntity.ok("Order cancelled successfully");
        } catch (Exception e) {
            logger.error("Error cancelling order {}: {}", orderId, e.getMessage());
            return ResponseEntity.badRequest().body("Error cancelling order: " + e.getMessage());
        }
    }
    
    /**
     * Get revenue statistics
     */
    @GetMapping("/revenue/stats")
    public ResponseEntity<RevenueStatsDto> getRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            RevenueStatsDto stats = adminService.getRevenueStats(startDate, endDate);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting revenue stats: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get monthly revenue data
     */
    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<RevenueStatsDto.MonthlyRevenue>> getMonthlyRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<RevenueStatsDto.MonthlyRevenue> monthlyRevenue = adminService.getMonthlyRevenue(startDate, endDate);
            return ResponseEntity.ok(monthlyRevenue);
        } catch (Exception e) {
            logger.error("Error getting monthly revenue: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all steam accounts for admin management
     */
    @GetMapping("/steam-accounts")
    public ResponseEntity<Page<SteamAccountAdminDto>> getSteamAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<SteamAccountAdminDto> accounts = steamAccountService.getSteamAccountsForAdmin(pageable);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            logger.error("Error getting steam accounts for admin: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all steam accounts for admin management (no pagination)
     */
    @GetMapping("/steam-accounts/all")
    public ResponseEntity<List<SteamAccountAdminDto>> getAllSteamAccounts() {
        try {
            List<SteamAccountAdminDto> accounts = steamAccountService.getAllSteamAccountsForAdmin();
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            logger.error("Error getting all steam accounts for admin: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get steam account by ID for admin
     */
    @GetMapping("/steam-accounts/{id}")
    public ResponseEntity<SteamAccountAdminDto> getSteamAccountById(@PathVariable Long id) {
        try {
            return steamAccountService.getSteamAccountByIdForAdmin(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error getting steam account by ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update steam account (admin)
     */
    @PutMapping("/steam-accounts/{id}")
    public ResponseEntity<SteamAccountDto> updateSteamAccount(
            @PathVariable Long id,
            @RequestBody AdminSteamAccountUpdateRequest request) {
        try {
            // Map admin update request to service DTO (validation handled in service)
            SteamAccountRequestDto dto = new SteamAccountRequestDto();
            dto.setAccountInfoId(request.getAccountInfoId()); // optional; service keeps existing when null
            dto.setAccountCode(request.getAccountCode());
            dto.setUsername(request.getUsername());
            dto.setPassword(request.getPassword()); // optional; service updates only if non-empty
            dto.setSteamGuard(request.getSteamGuard());
            dto.setStatus(request.getStatus());

            SteamAccountDto updated = steamAccountService.updateSteamAccount(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating steam account {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update steam account status (admin)
     */
    @PatchMapping("/steam-accounts/{id}/status")
    public ResponseEntity<SteamAccountDto> updateSteamAccountStatus(
            @PathVariable Long id,
            @RequestParam("status") AccountStockStatus status) {
        try {
            // Reuse update method with only status field
            SteamAccountRequestDto dto = new SteamAccountRequestDto();
            dto.setStatus(status);
            SteamAccountDto updated = steamAccountService.updateSteamAccount(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating steam account status {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete steam account (admin)
     */
    @DeleteMapping("/steam-accounts/{id}")
    public ResponseEntity<Void> deleteSteamAccount(@PathVariable Long id) {
        try {
            steamAccountService.deleteSteamAccount(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting steam account {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
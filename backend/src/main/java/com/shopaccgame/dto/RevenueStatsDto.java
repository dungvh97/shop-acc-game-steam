package com.shopaccgame.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class RevenueStatsDto {
    
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private BigDecimal monthlyGrowth;
    private List<MonthlyRevenue> monthlyRevenue;
    
    // Constructors
    public RevenueStatsDto() {}
    
    public RevenueStatsDto(BigDecimal totalRevenue, Long totalOrders, BigDecimal averageOrderValue, 
                          BigDecimal monthlyGrowth, List<MonthlyRevenue> monthlyRevenue) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.averageOrderValue = averageOrderValue;
        this.monthlyGrowth = monthlyGrowth;
        this.monthlyRevenue = monthlyRevenue;
    }
    
    // Getters and Setters
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public BigDecimal getMonthlyGrowth() {
        return monthlyGrowth;
    }
    
    public void setMonthlyGrowth(BigDecimal monthlyGrowth) {
        this.monthlyGrowth = monthlyGrowth;
    }
    
    public List<MonthlyRevenue> getMonthlyRevenue() {
        return monthlyRevenue;
    }
    
    public void setMonthlyRevenue(List<MonthlyRevenue> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }
    
    // Inner class for monthly revenue data
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal total;
        private Long count;
        private BigDecimal average;
        
        // Constructors
        public MonthlyRevenue() {}
        
        public MonthlyRevenue(String month, BigDecimal total, Long count) {
            this.month = month;
            this.total = total;
            this.count = count;
            this.average = count > 0 ? total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        }
        
        // Getters and Setters
        public String getMonth() {
            return month;
        }
        
        public void setMonth(String month) {
            this.month = month;
        }
        
        public BigDecimal getTotal() {
            return total;
        }
        
        public void setTotal(BigDecimal total) {
            this.total = total;
        }
        
        public Long getCount() {
            return count;
        }
        
        public void setCount(Long count) {
            this.count = count;
        }
        
        public BigDecimal getAverage() {
            return average;
        }
        
        public void setAverage(BigDecimal average) {
            this.average = average;
        }
    }
}

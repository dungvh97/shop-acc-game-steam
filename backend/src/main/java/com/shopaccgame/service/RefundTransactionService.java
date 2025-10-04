package com.shopaccgame.service;

import com.shopaccgame.entity.RefundTransaction;
import com.shopaccgame.entity.User;
import com.shopaccgame.repository.RefundTransactionRepository;
import com.shopaccgame.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RefundTransactionService {
    
    @Autowired
    private RefundTransactionRepository refundTransactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all refund transactions for a user
     */
    public List<RefundTransaction> getRefundTransactionsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        return refundTransactionRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    /**
     * Get all refund transactions for a user
     */
    public List<RefundTransaction> getRefundTransactionsForUser(User user) {
        return refundTransactionRepository.findByUserOrderByCreatedAtDesc(user);
    }
}

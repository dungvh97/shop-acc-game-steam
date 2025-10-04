package com.shopaccgame.repository;

import com.shopaccgame.entity.RefundTransaction;
import com.shopaccgame.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundTransactionRepository extends JpaRepository<RefundTransaction, Long> {
    
    List<RefundTransaction> findByUserOrderByCreatedAtDesc(User user);
    
    List<RefundTransaction> findByUser(User user);
    
    RefundTransaction findByRefundId(String refundId);
}

package com.shopaccgame.service;

import com.shopaccgame.entity.User;
import com.shopaccgame.entity.WalletDeposit;
import com.shopaccgame.repository.UserRepository;
import com.shopaccgame.repository.WalletDepositRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class UserBalanceService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletDepositRepository walletDepositRepository;

    /**
     * Calculate and update user balance based on paid deposits
     * @param username - Username to update balance for
     * @return Updated balance amount
     */
    public BigDecimal calculateAndUpdateBalance(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Get all paid deposits for the user
        List<WalletDeposit> paidDeposits = walletDepositRepository
            .findAllByUser_UsernameOrderByCreatedAtDesc(username)
            .stream()
            .filter(deposit -> deposit.getStatus() == WalletDeposit.Status.PAID)
            .toList();

        // Calculate total balance
        BigDecimal totalBalance = paidDeposits.stream()
            .map(WalletDeposit::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Update user balance
        user.setBalance(totalBalance);
        userRepository.save(user);

        return totalBalance;
    }

    /**
     * Get current user balance
     * @param username - Username to get balance for
     * @return Current balance amount
     */
    public BigDecimal getUserBalance(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getBalance();
    }

    /**
     * Update balance when a deposit is marked as paid
     * @param username - Username to update balance for
     * @param depositAmount - Amount of the deposit
     */
    public void addToBalance(String username, BigDecimal depositAmount) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        BigDecimal currentBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        BigDecimal newBalance = currentBalance.add(depositAmount);
        
        user.setBalance(newBalance);
        userRepository.save(user);
    }

    /**
     * Deduct from balance (for purchases)
     * @param username - Username to deduct from
     * @param amount - Amount to deduct
     * @return true if successful, false if insufficient balance
     */
    public boolean deductFromBalance(String username, BigDecimal amount) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        BigDecimal currentBalance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        
        if (currentBalance.compareTo(amount) < 0) {
            return false; // Insufficient balance
        }

        BigDecimal newBalance = currentBalance.subtract(amount);
        user.setBalance(newBalance);
        userRepository.save(user);
        
        return true;
    }
}

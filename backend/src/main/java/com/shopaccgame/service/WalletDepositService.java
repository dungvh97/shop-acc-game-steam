package com.shopaccgame.service;

import com.shopaccgame.entity.User;
import com.shopaccgame.entity.WalletDeposit;
import com.shopaccgame.repository.UserRepository;
import com.shopaccgame.repository.WalletDepositRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class WalletDepositService {

    @Autowired
    private WalletDepositRepository depositRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserBalanceService userBalanceService;

    public WalletDeposit createDeposit(String username, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String depositId = generateDepositId();
        WalletDeposit deposit = new WalletDeposit(user, amount, depositId);
        deposit.setQrCodeUrl(generateQrCodeUrl(depositId, amount));
        return depositRepository.save(deposit);
    }

    public WalletDeposit markDepositPaid(String depositId) {
        WalletDeposit deposit = depositRepository.findByDepositId(depositId)
            .orElseThrow(() -> new RuntimeException("Deposit not found"));
        deposit.markAsPaid();
        WalletDeposit savedDeposit = depositRepository.save(deposit);
        
        // Update user balance
        userBalanceService.addToBalance(deposit.getUser().getUsername(), deposit.getAmount());
        
        return savedDeposit;
    }

    public WalletDeposit getByDepositId(String depositId) {
        return depositRepository.findByDepositId(depositId)
            .orElseThrow(() -> new RuntimeException("Deposit not found"));
    }

    public List<WalletDeposit> getDepositsForUser(String username) {
        return depositRepository.findAllByUser_UsernameOrderByCreatedAtDesc(username);
    }

    private String generateDepositId() {
        return "DNT" + System.currentTimeMillis();
    }

    private String generateQrCodeUrl(String depositId, BigDecimal amount) {
        return String.format("https://qr.sepay.vn/img?acc=27727998888&bank=TPBank&amount=%s&des=%s",
            amount.toString(), depositId);
    }
}

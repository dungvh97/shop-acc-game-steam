package com.shopaccgame.repository;

import com.shopaccgame.entity.WalletDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletDepositRepository extends JpaRepository<WalletDeposit, Long> {
    Optional<WalletDeposit> findByDepositId(String depositId);
}



package com.shopaccgame.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.shopaccgame.repository")
@EnableTransactionManagement
public class JpaConfig {
    // Default JPA configuration is sufficient
}

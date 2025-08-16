package com.shopaccgame.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
@Order(1)
public class DatabaseReadinessChecker implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseReadinessChecker.class);
    private static final int MAX_RETRIES = 60; // Increased from 30
    private static final int RETRY_DELAY_MS = 2000; // Increased from 1000

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        // Allow disabling via property for local dev or when DB is external
        String enabled = System.getProperty("db.readiness.enabled", System.getenv().getOrDefault("DB_READINESS_ENABLED", "true"));
        if ("false".equalsIgnoreCase(enabled)) {
            logger.info("Database readiness check disabled by configuration");
            return;
        }
        logger.info("Checking database readiness...");
        
        int retryCount = 0;
        while (retryCount < MAX_RETRIES) {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(5)) {
                    logger.info("Database is ready! Connection successful.");
                    return;
                } else {
                    logger.warn("Database connection is not valid, retrying... (attempt {}/{})", 
                        retryCount + 1, MAX_RETRIES);
                }
            } catch (SQLException e) {
                logger.warn("Database connection failed, retrying... (attempt {}/{}) - Error: {}", 
                    retryCount + 1, MAX_RETRIES, e.getMessage());
                logger.debug("Full SQL exception: ", e);
            }
            
            retryCount++;
            if (retryCount < MAX_RETRIES) {
                Thread.sleep(RETRY_DELAY_MS);
            }
        }
        
        logger.error("Database connection failed after {} attempts", MAX_RETRIES);
        throw new RuntimeException("Database is not ready after maximum retry attempts");
    }
}

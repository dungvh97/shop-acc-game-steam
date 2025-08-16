package com.shopaccgame;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
@EnableScheduling
public class ShopAccGameApplication {

    private static final Logger logger = LoggerFactory.getLogger(ShopAccGameApplication.class);

    public static void main(String[] args) {
        System.out.println("Starting ShopAccGameApplication...");
        ApplicationContext context = SpringApplication.run(ShopAccGameApplication.class, args);
        System.out.println("ShopAccGameApplication started successfully!");
        
        // Test database connection
        try {
            DataSource dataSource = context.getBean(DataSource.class);
            try (Connection connection = dataSource.getConnection()) {
                logger.info("✅ Database connection successful");
                logger.info("Database URL: {}", connection.getMetaData().getURL());
                logger.info("Database Product: {}", connection.getMetaData().getDatabaseProductName());
                logger.info("Database Version: {}", connection.getMetaData().getDatabaseProductVersion());
            }
        } catch (Exception e) {
            logger.error("❌ Database connection failed: {}", e.getMessage());
            e.printStackTrace();
        }
    }
}

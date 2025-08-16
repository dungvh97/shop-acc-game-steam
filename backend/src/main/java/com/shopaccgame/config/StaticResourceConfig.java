package com.shopaccgame.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadsPath = Paths.get(uploadDir).toAbsolutePath().toString().replace("\\", "/");
        if (!uploadsPath.endsWith("/")) {
            uploadsPath += "/";
        }
        
        // Add multiple resource handlers for different path patterns
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadsPath);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath);
    }
}



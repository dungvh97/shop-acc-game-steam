package com.shopaccgame.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/upload")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file, 
                                                          @RequestParam(value = "type", defaultValue = "steam-accounts") String type) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (file.isEmpty()) {
                response.put("error", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("error", "File must be an image");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Validate upload type
            String uploadType = type;
            if (!uploadType.equals("steam-accounts") && !uploadType.equals("games")) {
                uploadType = "steam-accounts"; // default
            }
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, uploadType);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = uploadType + "_" + UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            // Return the file URL
            String fileUrl = "/api/uploads/" + uploadType + "/" + filename;
            
            response.put("message", "File uploaded successfully");
            response.put("filename", filename);
            response.put("url", fileUrl);
            response.put("size", file.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            response.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

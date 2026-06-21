package com.ecommerce.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    public String storeFile(MultipartFile file) {
        String original = file.getOriginalFilename();
        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;

        try {
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/api/admin/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + filename, e);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        try {
            Files.deleteIfExists(uploadPath.resolve(filename));
        } catch (IOException e) {
            // ignore
        }
    }
}

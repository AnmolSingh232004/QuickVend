package com.ecommerce.controller;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.request.OrderStatusRequest;
import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.service.CategoryService;
import com.ecommerce.service.DashboardService;
import com.ecommerce.service.FileStorageService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ProductService;
import com.ecommerce.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final DashboardService dashboardService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .createdAt(user.getCreatedAt())
                        .build())
                .toList());
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @PostMapping("/products/{id}/image")
    public ResponseEntity<ProductResponse> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        ProductResponse updated = productService.updateProductImage(id, fileUrl);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = filename.endsWith(".png") ? "image/png" :
                                    filename.endsWith(".jpg") || filename.endsWith(".jpeg") ? "image/jpeg" :
                                    filename.endsWith(".gif") ? "image/gif" : "application/octet-stream";
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            }
        } catch (MalformedURLException e) {
            // fall through
        }
        return ResponseEntity.notFound().build();
    }
}

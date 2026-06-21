package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ProductService productService;

    private Product createTestProduct(Long id) {
        return Product.builder()
                .id(id)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(29.99))
                .sku("TST-001")
                .stockQuantity(10)
                .build();
    }

    @Test
    void getProductById_ShouldReturnProduct_WhenExists() {
        Product product = createTestProduct(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(reviewRepository.findAverageRatingByProductId(1L)).thenReturn(4.5);
        when(reviewRepository.findByProductIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ProductResponse response = productService.getProductById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Product", response.getName());
        assertEquals(BigDecimal.valueOf(29.99), response.getPrice());
    }

    @Test
    void getProductById_ShouldThrow_WhenNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> productService.getProductById(99L));
    }

    @Test
    void createProduct_ShouldSucceed_WithoutCategory() {
        ProductRequest request = new ProductRequest();
        request.setName("New Product");
        request.setDescription("New Description");
        request.setPrice(BigDecimal.valueOf(49.99));
        request.setSku("NEW-001");
        request.setStockQuantity(5);

        Product savedProduct = Product.builder()
                .id(1L)
                .name("New Product")
                .description("New Description")
                .price(BigDecimal.valueOf(49.99))
                .sku("NEW-001")
                .stockQuantity(5)
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
        when(reviewRepository.findAverageRatingByProductId(1L)).thenReturn(null);
        when(reviewRepository.findByProductIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("New Product", response.getName());
        assertEquals(BigDecimal.valueOf(49.99), response.getPrice());
        assertNull(response.getCategoryId());
    }

    @Test
    void createProduct_ShouldSucceed_WithCategory() {
        Category category = Category.builder().id(2L).name("Electronics").slug("electronics").build();

        ProductRequest request = new ProductRequest();
        request.setName("Laptop");
        request.setDescription("A nice laptop");
        request.setPrice(BigDecimal.valueOf(999.99));
        request.setSku("LAP-001");
        request.setStockQuantity(3);
        request.setCategoryId(2L);

        Product savedProduct = Product.builder()
                .id(1L)
                .name("Laptop")
                .description("A nice laptop")
                .price(BigDecimal.valueOf(999.99))
                .sku("LAP-001")
                .stockQuantity(3)
                .category(category)
                .build();

        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
        when(reviewRepository.findAverageRatingByProductId(1L)).thenReturn(null);
        when(reviewRepository.findByProductIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("Laptop", response.getName());
        assertEquals(2L, response.getCategoryId());
        assertEquals("Electronics", response.getCategoryName());
    }

    @Test
    void deleteProduct_ShouldSucceed_WhenExists() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.deleteProduct(1L);

        verify(productRepository).deleteById(1L);
    }

    @Test
    void deleteProduct_ShouldThrow_WhenNotFound() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> productService.deleteProduct(99L));
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    void updateProduct_ShouldUpdateFields() {
        Category category = Category.builder().id(2L).name("Electronics").slug("electronics").build();
        Product existing = createTestProduct(1L);

        ProductRequest request = new ProductRequest();
        request.setName("Updated Product");
        request.setDescription("Updated Description");
        request.setPrice(BigDecimal.valueOf(39.99));
        request.setSku("TST-001");
        request.setStockQuantity(20);
        request.setCategoryId(2L);

        Product updatedProduct = Product.builder()
                .id(1L)
                .name("Updated Product")
                .description("Updated Description")
                .price(BigDecimal.valueOf(39.99))
                .sku("TST-001")
                .stockQuantity(20)
                .category(category)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
        when(reviewRepository.findAverageRatingByProductId(1L)).thenReturn(4.0);
        when(reviewRepository.findByProductIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ProductResponse response = productService.updateProduct(1L, request);

        assertEquals("Updated Product", response.getName());
        assertEquals(BigDecimal.valueOf(39.99), response.getPrice());
        assertEquals(2L, response.getCategoryId());
    }

    @Test
    void updateProductImage_ShouldUpdateImageUrl() {
        Product product = createTestProduct(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product savedWithImage = createTestProduct(1L);
        savedWithImage.setImageUrl("/api/admin/uploads/new-image.jpg");
        when(productRepository.save(any(Product.class))).thenReturn(savedWithImage);
        when(reviewRepository.findAverageRatingByProductId(1L)).thenReturn(4.0);
        when(reviewRepository.findByProductIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ProductResponse response = productService.updateProductImage(1L, "/api/admin/uploads/new-image.jpg");

        assertEquals("/api/admin/uploads/new-image.jpg", response.getImageUrl());
    }
}

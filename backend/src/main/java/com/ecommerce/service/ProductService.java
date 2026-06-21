package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PagedResponse<ProductResponse> getProductsPaged(String search, Long categoryId,
                                                            BigDecimal minPrice, BigDecimal maxPrice,
                                                            String sort, int page, int size) {
        Sort sorting = switch (sort) {
            case "price_asc" -> Sort.by("price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name" -> Sort.by("name");
            case "newest" -> Sort.by(Sort.Direction.DESC, "created_at");
            default -> Sort.by("name");
        };
        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<Product> productPage = productRepository.findByFilters(search, categoryId, minPrice, maxPrice, pageable);
        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return toResponse(product);
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductResponse> searchProducts(String keyword) {
        return productRepository.search(keyword).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductResponse> getProductsByIds(List<Long> ids) {
        return productRepository.findAllById(ids).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .sku(request.getSku())
                .stockQuantity(request.getStockQuantity())
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        }

        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        product.setSku(request.getSku());
        product.setStockQuantity(request.getStockQuantity());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateProductImage(Long id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        product.setImageUrl(imageUrl);
        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    private ProductResponse toResponse(Product product) {
        Long pid = product.getId();
        Double avgRating = reviewRepository.findAverageRatingByProductId(pid);
        List<com.ecommerce.entity.Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(pid);
        return ProductResponse.builder()
                .id(pid)
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .avgRating(avgRating)
                .reviewCount(reviews.size())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}

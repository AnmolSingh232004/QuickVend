package com.ecommerce.controller;

import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        if (page >= 0 && size > 0) {
            return ResponseEntity.ok(productService.getProductsPaged(search, categoryId, minPrice, maxPrice, sort, page, size));
        }
        if (search != null) {
            return ResponseEntity.ok(productService.searchProducts(search));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/batch")
    public ResponseEntity<List<ProductResponse>> getProductsByIds(@RequestParam String ids) {
        List<Long> idList = java.util.Arrays.stream(ids.split(","))
                .map(String::trim).map(Long::parseLong).collect(Collectors.toList());
        return ResponseEntity.ok(productService.getProductsByIds(idList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}

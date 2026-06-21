package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    private String imageUrl;

    @NotBlank
    private String sku;

    @NotNull
    private Integer stockQuantity;

    private Long categoryId;
}

package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}

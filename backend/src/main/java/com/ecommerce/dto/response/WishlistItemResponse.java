package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class WishlistItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private String productImage;
    private LocalDateTime createdAt;
}

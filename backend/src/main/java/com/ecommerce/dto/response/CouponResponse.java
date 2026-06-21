package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class CouponResponse {
    private Long id;
    private String code;
    private Integer discountPercent;
    private Integer maxUses;
    private Integer usedCount;
    private Boolean isActive;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}

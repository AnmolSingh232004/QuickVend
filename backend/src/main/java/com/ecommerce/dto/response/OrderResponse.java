package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private String paymentMethod;
    private String shippingAddress;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}

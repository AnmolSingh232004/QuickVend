package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private Long amount;
    private String currency;
    private String keyId;
}

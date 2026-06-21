package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String shippingAddress;
    private String couponCode;
}

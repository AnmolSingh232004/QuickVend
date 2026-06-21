package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RazorpayPaymentRequest {
    @NotBlank
    private String razorpayOrderId;

    @NotBlank
    private String razorpayPaymentId;

    @NotBlank
    private String razorpaySignature;

    @NotBlank
    private String shippingAddress;

    private String couponCode;
}

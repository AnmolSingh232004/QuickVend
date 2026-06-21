package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull
    @Positive
    private Integer quantity;
}

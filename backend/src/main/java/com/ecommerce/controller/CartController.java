package com.ecommerce.controller;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<CartItemResponse> addToCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(user, productId, request.getQuantity()));
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequest request) {
        CartItemResponse response = cartService.updateCartItem(user, itemId, request.getQuantity());
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Void> removeFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {
        cartService.removeFromCart(user, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }
}

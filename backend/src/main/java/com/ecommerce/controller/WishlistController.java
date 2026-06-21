package com.ecommerce.controller;

import com.ecommerce.dto.response.WishlistItemResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(user));
    }

    @PostMapping
    public ResponseEntity<WishlistItemResponse> addToWishlist(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(wishlistService.addToWishlist(user, body.get("productId")));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.noContent().build();
    }
}

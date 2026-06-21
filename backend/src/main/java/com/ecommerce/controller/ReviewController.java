package com.ecommerce.controller;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.addReview(productId, request, user));
    }
}

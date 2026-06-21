package com.ecommerce.controller;

import com.ecommerce.dto.request.CouponRequest;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.createCoupon(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponResponse> validateCoupon(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(couponService.validateCoupon(body.get("code")));
    }
}

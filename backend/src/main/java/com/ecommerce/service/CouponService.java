package com.ecommerce.service;

import com.ecommerce.dto.request.CouponRequest;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.entity.Coupon;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new BadRequestException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .discountPercent(request.getDiscountPercent())
                .maxUses(request.getMaxUses())
                .expiresAt(request.getExpiresAt())
                .build();

        return toResponse(couponRepository.save(coupon));
    }

    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));
        couponRepository.delete(coupon);
    }

    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.getIsActive()) {
            throw new BadRequestException("Coupon is no longer active");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BadRequestException("Coupon usage limit reached");
        }

        return toResponse(coupon);
    }

    public BigDecimal applyDiscount(BigDecimal amount, String couponCode) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.getIsActive()) {
            throw new BadRequestException("Coupon is no longer active");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BadRequestException("Coupon usage limit reached");
        }

        BigDecimal discount = amount.multiply(BigDecimal.valueOf(coupon.getDiscountPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return amount.subtract(discount);
    }

    public void incrementUsage(String couponCode) {
        couponRepository.findByCodeIgnoreCase(couponCode).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountPercent(coupon.getDiscountPercent())
                .maxUses(coupon.getMaxUses())
                .usedCount(coupon.getUsedCount())
                .isActive(coupon.getIsActive())
                .expiresAt(coupon.getExpiresAt())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}

package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    @Builder.Default
    private Integer discountPercent = 10;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxUses = 100;

    @Column(nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private LocalDateTime expiresAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

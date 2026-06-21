package com.ecommerce.service;

import com.ecommerce.dto.response.WishlistItemResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.WishlistItem;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public List<WishlistItemResponse> getUserWishlist(User user) {
        return wishlistRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public WishlistItemResponse addToWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new BadRequestException("Product already in wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        return toResponse(wishlistRepository.save(item));
    }

    public void removeFromWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        wishlistRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new NotFoundException("Product not in wishlist"));

        wishlistRepository.deleteByUserAndProduct(user, product);
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productPrice(item.getProduct().getPrice())
                .productImage(item.getProduct().getImageUrl())
                .createdAt(item.getCreatedAt())
                .build();
    }
}

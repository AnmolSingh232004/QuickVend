package com.ecommerce.service;

import com.ecommerce.dto.response.CartItemResponse;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public List<CartItemResponse> getCart(User user) {
        return cartItemRepository.findByUser(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public CartItemResponse addToCart(User user, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock");
        }

        CartItem existing = cartItemRepository.findByUserAndProduct(user, product).orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            return toResponse(cartItemRepository.save(existing));
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(quantity)
                .build();

        return toResponse(cartItemRepository.save(cartItem));
    }

    public CartItemResponse updateCartItem(User user, Long itemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        return toResponse(cartItemRepository.save(cartItem));
    }

    public void removeFromCart(User user, Long itemId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }

    private CartItemResponse toResponse(CartItem item) {
        BigDecimal subtotal = item.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(item.getProduct().getImageUrl())
                .productPrice(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}

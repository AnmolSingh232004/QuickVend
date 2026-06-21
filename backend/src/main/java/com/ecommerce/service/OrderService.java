package com.ecommerce.service;

import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.entity.enums.PaymentMethod;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final CouponService couponService;

    public List<OrderResponse> getUserOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!user.getRole().name().equals("ROLE_ADMIN") && !order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Order does not belong to user");
        }

        return toResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse checkout(User user, String shippingAddress, String couponCode) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + product.getName());
            }
            totalAmount = totalAmount.add(
                    product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        BigDecimal finalAmount = totalAmount;
        String appliedCode = null;
        BigDecimal discount = null;

        if (couponCode != null && !couponCode.isBlank()) {
            couponService.validateCoupon(couponCode);
            finalAmount = couponService.applyDiscount(totalAmount, couponCode);
            appliedCode = couponCode;
            discount = totalAmount.subtract(finalAmount);
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .totalAmount(finalAmount)
                .couponCode(appliedCode)
                .discountAmount(discount)
                .shippingAddress(shippingAddress)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
            savedOrder.getOrderItems().add(orderItem);
        }

        orderRepository.save(savedOrder);
        cartItemRepository.deleteByUser(user);

        if (appliedCode != null) {
            couponService.incrementUsage(appliedCode);
        }

        emailService.sendOrderConfirmation(savedOrder);

        return toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This order does not belong to you");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel order that is already shipped or delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse checkoutCod(User user, String shippingAddress, String couponCode) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + product.getName());
            }
            totalAmount = totalAmount.add(
                    product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        BigDecimal finalAmount = totalAmount;
        String appliedCode = null;
        BigDecimal discount = null;

        if (couponCode != null && !couponCode.isBlank()) {
            couponService.validateCoupon(couponCode);
            finalAmount = couponService.applyDiscount(totalAmount, couponCode);
            appliedCode = couponCode;
            discount = totalAmount.subtract(finalAmount);
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.COD)
                .totalAmount(finalAmount)
                .couponCode(appliedCode)
                .discountAmount(discount)
                .shippingAddress(shippingAddress)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
            savedOrder.getOrderItems().add(orderItem);
        }

        orderRepository.save(savedOrder);
        cartItemRepository.deleteByUser(user);

        if (appliedCode != null) {
            couponService.incrementUsage(appliedCode);
        }

        emailService.sendOrderConfirmation(savedOrder);

        return toResponse(savedOrder);
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImage(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "COD")
                .shippingAddress(order.getShippingAddress())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }
}

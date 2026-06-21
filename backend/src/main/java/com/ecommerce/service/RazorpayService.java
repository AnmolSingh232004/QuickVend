package com.ecommerce.service;

import com.ecommerce.dto.response.RazorpayOrderResponse;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final CouponService couponService;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private com.razorpay.RazorpayClient getClient() throws com.razorpay.RazorpayException {
        return new com.razorpay.RazorpayClient(keyId, keySecret);
    }

    public RazorpayOrderResponse createOrder(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        long totalPaise = cartItems.stream()
                .mapToLong(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        .multiply(BigDecimal.valueOf(100))
                        .longValue())
                .sum();

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", totalPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + UUID.randomUUID().toString().substring(0, 8));

            com.razorpay.Order razorpayOrder = getClient().orders.create(orderRequest);

            return RazorpayOrderResponse.builder()
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(totalPaise)
                    .currency("INR")
                    .keyId(keyId)
                    .build();
        } catch (com.razorpay.RazorpayException e) {
            throw new BadRequestException("Failed to create payment order: " + e.getMessage());
        }
    }

    @Transactional
    public Order verifyAndCreateOrder(User user, String razorpayOrderId, String razorpayPaymentId,
                                       String razorpaySignature, String shippingAddress, String couponCode) {
        try {
            String generatedSignature = HmacSHA256(razorpayOrderId + "|" + razorpayPaymentId, keySecret);
            if (!generatedSignature.equals(razorpaySignature)) {
                throw new BadRequestException("Payment verification failed: invalid signature");
            }
        } catch (Exception e) {
            throw new BadRequestException("Payment verification failed");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal total = cartItems.stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal finalAmount = total;
        String appliedCode = null;
        BigDecimal discount = null;

        if (couponCode != null && !couponCode.isBlank()) {
            couponService.validateCoupon(couponCode);
            finalAmount = couponService.applyDiscount(total, couponCode);
            appliedCode = couponCode;
            discount = total.subtract(finalAmount);
        }

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .status(OrderStatus.PENDING)
                .totalAmount(finalAmount)
                .couponCode(appliedCode)
                .discountAmount(discount)
                .shippingAddress(shippingAddress)
                .build();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
            order.getOrderItems().add(orderItem);
        }

        orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);

        if (appliedCode != null) {
            couponService.incrementUsage(appliedCode);
        }

        emailService.sendOrderConfirmation(order);

        return order;
    }

    private String HmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] digest = mac.doFinal(data.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

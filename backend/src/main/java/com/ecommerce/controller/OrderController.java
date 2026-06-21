package com.ecommerce.controller;

import com.ecommerce.dto.request.CheckoutRequest;
import com.ecommerce.dto.request.RazorpayPaymentRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.RazorpayOrderResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.InvoiceService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final RazorpayService razorpayService;
    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(user, id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(user, id));
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkout(user, request.getShippingAddress(), request.getCouponCode()));
    }

    @PostMapping("/cod")
    public ResponseEntity<OrderResponse> checkoutCod(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkoutCod(user, request.getShippingAddress(), request.getCouponCode()));
    }

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(razorpayService.createOrder(user));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<OrderResponse> verifyPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody RazorpayPaymentRequest request) {
        com.ecommerce.entity.Order order = razorpayService.verifyAndCreateOrder(
                user,
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                request.getShippingAddress(),
                request.getCouponCode());
        return ResponseEntity.ok(orderService.toResponse(order));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        byte[] pdf = invoiceService.generateInvoice(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

package com.ecommerce.service;

import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.entity.*;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private OrderService orderService;

    private User createTestUser() {
        return User.builder().id(1L).name("Test User").email("test@example.com").build();
    }

    private Product createTestProduct(Long id, int stock) {
        return Product.builder()
                .id(id)
                .name("Product " + id)
                .price(BigDecimal.valueOf(19.99))
                .sku("PRD-" + id)
                .stockQuantity(stock)
                .build();
    }

    @Test
    void checkoutCod_ShouldSucceed_WithValidCart() {
        User user = createTestUser();
        Product product = createTestProduct(1L, 10);

        CartItem cartItem = CartItem.builder()
                .id(1L)
                .user(user)
                .product(product)
                .quantity(2)
                .build();

        when(cartItemRepository.findByUser(user)).thenReturn(List.of(cartItem));

        Order savedOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST123")
                .user(user)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(39.98))
                .shippingAddress("123 Test St")
                .orderItems(new ArrayList<>())
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        doNothing().when(cartItemRepository).deleteByUser(user);
        doNothing().when(emailService).sendOrderConfirmation(any(Order.class));

        OrderResponse response = orderService.checkoutCod(user, "123 Test St", null);

        assertNotNull(response);
        assertEquals(OrderStatus.PENDING.name(), response.getStatus());
        assertEquals(BigDecimal.valueOf(39.98), response.getTotalAmount());

        verify(orderRepository, atLeastOnce()).save(any(Order.class));
        verify(cartItemRepository).deleteByUser(user);
        verify(productRepository).save(any(Product.class));
        verify(emailService).sendOrderConfirmation(any(Order.class));
    }

    @Test
    void checkoutCod_ShouldThrow_WhenCartEmpty() {
        User user = createTestUser();

        when(cartItemRepository.findByUser(user)).thenReturn(List.of());

        assertThrows(BadRequestException.class,
                () -> orderService.checkoutCod(user, "123 Test St", null));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkoutCod_ShouldThrow_WhenStockInsufficient() {
        User user = createTestUser();
        Product product = createTestProduct(1L, 1);

        CartItem cartItem = CartItem.builder()
                .id(1L)
                .user(user)
                .product(product)
                .quantity(5)
                .build();

        when(cartItemRepository.findByUser(user)).thenReturn(List.of(cartItem));

        assertThrows(BadRequestException.class,
                () -> orderService.checkoutCod(user, "123 Test St", null));
    }

    @Test
    void cancelOrder_ShouldSucceed_WhenPending() {
        User user = createTestUser();
        Product product = createTestProduct(1L, 5);

        OrderItem orderItem = OrderItem.builder()
                .id(1L)
                .product(product)
                .quantity(2)
                .price(BigDecimal.valueOf(19.99))
                .build();

        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST")
                .user(user)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(39.98))
                .shippingAddress("123 Test St")
                .orderItems(new ArrayList<>(List.of(orderItem)))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.cancelOrder(user, 1L);

        assertEquals(OrderStatus.CANCELLED.name(), response.getStatus());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void cancelOrder_ShouldThrow_WhenShipped() {
        User user = createTestUser();
        Order order = Order.builder()
                .id(1L)
                .user(user)
                .status(OrderStatus.SHIPPED)
                .totalAmount(BigDecimal.valueOf(39.98))
                .shippingAddress("123 Test St")
                .orderItems(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> orderService.cancelOrder(user, 1L));
    }

    @Test
    void cancelOrder_ShouldThrow_WhenNotOwnedByUser() {
        User user = createTestUser();
        User otherUser = User.builder().id(2L).name("Other").email("other@example.com").build();

        Order order = Order.builder()
                .id(1L)
                .user(otherUser)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(39.98))
                .shippingAddress("123 Test St")
                .orderItems(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> orderService.cancelOrder(user, 1L));
    }

    @Test
    void updateOrderStatus_ShouldUpdateStatus() {
        Product product = createTestProduct(1L, 5);
        OrderItem orderItem = OrderItem.builder()
                .id(1L)
                .product(product)
                .quantity(1)
                .price(BigDecimal.valueOf(19.99))
                .build();

        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST")
                .user(createTestUser())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(19.99))
                .shippingAddress("123 Test St")
                .orderItems(new ArrayList<>(List.of(orderItem)))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED);

        assertEquals(OrderStatus.CONFIRMED.name(), response.getStatus());
    }

    @Test
    void getOrderById_ShouldThrow_WhenNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> orderService.getOrderById(createTestUser(), 99L));
    }
}

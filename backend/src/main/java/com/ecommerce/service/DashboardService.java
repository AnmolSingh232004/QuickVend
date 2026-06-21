package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getStats() {
        List<Order> allOrders = orderRepository.findAll();

        long totalOrders = allOrders.size();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        long pendingOrders = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalProducts", totalProducts);
        stats.put("totalUsers", totalUsers);
        stats.put("pendingOrders", pendingOrders);
        stats.put("totalRevenue", totalRevenue);

        Map<String, Long> ordersByStatus = Arrays.stream(OrderStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        s -> allOrders.stream().filter(o -> o.getStatus() == s).count()
                ));
        stats.put("ordersByStatus", ordersByStatus);

        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Order> recentOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.getCreatedAt().isAfter(sixMonthsAgo))
                .toList();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            BigDecimal revenue = recentOrders.stream()
                    .filter(o -> !o.getCreatedAt().isBefore(monthStart) && o.getCreatedAt().isBefore(monthEnd))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String label = monthStart.getMonth().toString().substring(0, 3) + " '" + String.valueOf(monthStart.getYear()).substring(2);
            monthlyRevenue.put(label, revenue);
        }
        stats.put("monthlyRevenue", monthlyRevenue);

        return stats;
    }
}

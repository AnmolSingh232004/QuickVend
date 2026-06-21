package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> search(@Param("keyword") String keyword);

    @Query(value = "SELECT p.* FROM products p WHERE " +
           "(cast(:search as text) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:search as text), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', cast(:search as text), '%'))) AND " +
           "(:categoryId IS NULL OR p.category_id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)",
           countQuery = "SELECT count(*) FROM products p WHERE " +
           "(cast(:search as text) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:search as text), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', cast(:search as text), '%'))) AND " +
           "(:categoryId IS NULL OR p.category_id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)",
           nativeQuery = true)
    Page<Product> findByFilters(@Param("search") String search,
                                @Param("categoryId") Long categoryId,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                Pageable pageable);
}

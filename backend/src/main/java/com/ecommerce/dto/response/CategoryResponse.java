package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private LocalDateTime createdAt;
}

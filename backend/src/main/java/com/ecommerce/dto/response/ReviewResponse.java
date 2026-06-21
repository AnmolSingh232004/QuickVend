package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

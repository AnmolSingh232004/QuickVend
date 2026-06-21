package com.ecommerce.service;

import com.ecommerce.dto.request.ReviewRequest;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewResponse addReview(Long productId, ReviewRequest request, User user) {
        if (reviewRepository.existsByProductIdAndUserId(productId, user.getId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public Double getAverageRating(Long productId) {
        return reviewRepository.findAverageRatingByProductId(productId);
    }

    public int getReviewCount(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).size();
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

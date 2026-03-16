 package com.example.backend.service.serviceImpl;
import com.example.backend.dto.requestdto.ReviewRequest;
import com.example.backend.dto.respdto.ReviewResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, 
                             ProductRepository productRepository, 
                             UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public ReviewResponse addReview(ReviewRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setProduct(product);
        review.setUser(user);

        Review savedReview = reviewRepository.save(review);

        // Update Product Average Rating
        updateProductAverageRating(product);

        return mapToReviewResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    private void updateProductAverageRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        if (reviews.isEmpty()) {
            product.setRating(0.0);
        } else {
            double average = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(Math.round(average * 10.0) / 10.0); // Round to 1 decimal place
        }
        productRepository.save(product);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getUser().getName(),
                review.getUser().getId()
        );
    }
}

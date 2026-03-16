// package com.example.backend.service;

// public class ReviewService {
    
// }


package com.example.backend.service;

import com.example.backend.dto.requestdto.ReviewRequest;
import com.example.backend.dto.respdto.ReviewResponse;
import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest request, Long userId);
    List<ReviewResponse> getProductReviews(Long productId);
}

// package com.example.backend.controller;

// public class ReviewController {
    
// }


package com.example.backend.controller;

import com.example.backend.dto.requestdto.ReviewRequest;
import com.example.backend.dto.respdto.ReviewResponse;
import com.example.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long userId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addReview(request, userId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }
}


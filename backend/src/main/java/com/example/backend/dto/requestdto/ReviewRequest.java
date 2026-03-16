package com.example.backend.dto.requestdto;

// public class ReviewRequest {
    
// }


import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ReviewRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;

    @NotNull
    private Long productId;
}


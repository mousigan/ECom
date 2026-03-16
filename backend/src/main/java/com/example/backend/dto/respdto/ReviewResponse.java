package com.example.backend.dto.respdto;

import lombok.Data;

@Data
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String userName;
    private Long userId;

    public ReviewResponse(Long id, Integer rating, String comment, String userName, Long userId) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.userName = userName;
        this.userId = userId;
    }
}


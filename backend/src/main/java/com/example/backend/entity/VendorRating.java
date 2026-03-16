package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer rating;
    private String review;
    private LocalDateTime createdAt;

    public VendorRating(User vendor, User user, Integer rating, String review) {
        this.vendor = vendor;
        this.user = user;
        this.rating = rating;
        this.review = review;
        this.createdAt = LocalDateTime.now();
    }
}

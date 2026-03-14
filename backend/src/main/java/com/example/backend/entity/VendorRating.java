package com.example.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

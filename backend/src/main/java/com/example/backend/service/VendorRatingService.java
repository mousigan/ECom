package com.example.backend.service;

import java.util.List;

import com.example.backend.entity.VendorRating;

public interface VendorRatingService {
    void submitRating(Long userId, Long vendorId, Integer rating, String review);
    List<VendorRating> getVendorRatings(Long vendorId);
    Double getAverageRating(Long vendorId);
}

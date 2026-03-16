package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.VendorRating;

public interface VendorRatingRepository extends JpaRepository<VendorRating, Long> {
    List<VendorRating> findByVendorId(Long vendorId);
    
    @Query("SELECT AVG(vr.rating) FROM VendorRating vr WHERE vr.vendor.id = :vendorId")
    Double getAverageRatingForVendor(Long vendorId);
}

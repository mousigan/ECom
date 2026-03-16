package com.example.backend.repository;
import com.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByProductId(Long productId);
    
    // findByProduct_Vendor_Id removed because Product no longer has a direct vendor link.
    // Vendor specific reviews should move to VendorRating or be linked via VendorProduct.
}
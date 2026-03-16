package com.example.backend.service.serviceImpl;

import com.example.backend.entity.User;
import com.example.backend.entity.VendorRating;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VendorRatingRepository;
import com.example.backend.service.VendorRatingService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VendorRatingServiceImpl implements VendorRatingService {

    private final VendorRatingRepository vendorRatingRepository;
    private final UserRepository userRepository;

    public VendorRatingServiceImpl(VendorRatingRepository vendorRatingRepository, UserRepository userRepository) {
        this.vendorRatingRepository = vendorRatingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void submitRating(Long userId, Long vendorId, Integer rating, String review) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        VendorRating vr = new VendorRating();
        vr.setUser(user);
        vr.setVendor(vendor);
        vr.setRating(rating);
        vr.setReview(review);
        
        vendorRatingRepository.save(vr);
    }

    @Override
    public List<VendorRating> getVendorRatings(Long vendorId) {
        return vendorRatingRepository.findByVendorId(vendorId);
    }

    @Override
    public Double getAverageRating(Long vendorId) {
        Double avg = vendorRatingRepository.getAverageRatingForVendor(vendorId);
        return avg != null ? avg : 0.0;
    }
}
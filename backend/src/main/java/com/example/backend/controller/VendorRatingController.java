package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.entity.VendorRating;
import com.example.backend.service.VendorRatingService;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:3000")
public class VendorRatingController {

    private final VendorRatingService vendorRatingService;

    public VendorRatingController(VendorRatingService vendorRatingService) {
        this.vendorRatingService = vendorRatingService;
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitRating(
            @RequestParam Long userId,
            @RequestParam Long vendorId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String review) {
        vendorRatingService.submitRating(userId, vendorId, rating, review);
        return ResponseEntity.ok("Rating submitted successfully");
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<VendorRating>> getVendorRatings(@PathVariable Long vendorId) {
        return ResponseEntity.ok(vendorRatingService.getVendorRatings(vendorId));
    }

    @GetMapping("/vendor/{vendorId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long vendorId) {
        return ResponseEntity.ok(vendorRatingService.getAverageRating(vendorId));
    }
}

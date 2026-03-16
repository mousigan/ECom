
 package com.example.backend.dto.respdto;
import java.util.List;

public class ProductDetailResponse {
    private ProductResponse product;
    private List<VendorListingResponse> vendors;
    private List<ReviewResponse> reviews;

    public ProductDetailResponse() {
    }

    public ProductDetailResponse(ProductResponse product, List<VendorListingResponse> vendors, List<ReviewResponse> reviews) {
        this.product = product;
        this.vendors = vendors;
        this.reviews = reviews;
    }

    // Getters and Setters
    public ProductResponse getProduct() { return product; }
    public void setProduct(ProductResponse product) { this.product = product; }
    public List<VendorListingResponse> getVendors() { return vendors; }
    public void setVendors(List<VendorListingResponse> vendors) { this.vendors = vendors; }
    public List<ReviewResponse> getReviews() { return reviews; }
    public void setReviews(List<ReviewResponse> reviews) { this.reviews = reviews; }
}

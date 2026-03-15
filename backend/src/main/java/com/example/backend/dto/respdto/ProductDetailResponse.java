
package com.example.backend.dto.respdto;

import java.util.List;

public class ProductDetailResponse {
    private ProductResponse product;
    private List<VendorListingResponse> vendors;

    public ProductDetailResponse() {
    }

    public ProductDetailResponse(ProductResponse product, List<VendorListingResponse> vendors) {
        this.product = product;
        this.vendors = vendors;
    }

    // Getters and Setters
    public ProductResponse getProduct() { return product; }
    public void setProduct(ProductResponse product) { this.product = product; }
    public List<VendorListingResponse> getVendors() { return vendors; }
    public void setVendors(List<VendorListingResponse> vendors) { this.vendors = vendors; }
}

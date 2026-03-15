package com.example.backend.service;

import com.example.backend.dto.requestdto.ProductRequest;
import com.example.backend.dto.requestdto.VendorProductRequest;
import com.example.backend.dto.respdto.*;
import java.util.List;

public interface ProductService {
    // Marketplace (for Users)
    List<ProductResponse> getMarketplaceProducts(String category, String search);
    ProductDetailResponse getProductDetails(Long productId);
    
    // Vendor specific
    void addVendorProduct(Long vendorId, ProductRequest request); // Direct addition
    List<VendorProductResponse> getVendorInventory(Long vendorId);
    
    // Comparison
    List<ProductResponse> compareProducts(List<Long> productIds);
    
    // Categories
    List<CategoryResponse> getAllCategories();
}
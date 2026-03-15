package com.example.backend.controller;

import com.example.backend.dto.requestdto.ProductRequest;
import com.example.backend.dto.requestdto.VendorProductRequest;
import com.example.backend.dto.respdto.*;
import com.example.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Marketplace (User View)
    @GetMapping("/marketplace")
    public ResponseEntity<List<ProductResponse>> getMarketplaceProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(productService.getMarketplaceProducts(category, search));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ProductDetailResponse> getProductDetails(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetails(id));
    }

    // Vendor specific: Add new product directly
    @PostMapping("/add")
    public ResponseEntity<String> addVendorProduct(@RequestParam Long vendorId, @RequestBody ProductRequest request) {
        productService.addVendorProduct(vendorId, request);
        return ResponseEntity.ok("Product successfully added to your store");
    }

    @GetMapping("/vendor-inventory")
    public ResponseEntity<List<VendorProductResponse>> getVendorInventory(@RequestParam Long vendorId) {
        return ResponseEntity.ok(productService.getVendorInventory(vendorId));
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    // Comparison
    @GetMapping("/compare")
    public ResponseEntity<List<ProductResponse>> compareProducts(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(productService.compareProducts(ids));
    }
}
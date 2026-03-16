package com.example.backend.controller;

import com.example.backend.dto.respdto.VendorProductResponse;
import com.example.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = "http://localhost:3000")
public class VendorController {

    private final ProductService productService;

    public VendorController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{vendorId}/products")
    public ResponseEntity<List<VendorProductResponse>> getVendorProducts(@PathVariable Long vendorId) {
        return ResponseEntity.ok(productService.getVendorInventory(vendorId));
    }
}
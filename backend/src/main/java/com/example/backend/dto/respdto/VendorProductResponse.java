package com.example.backend.dto.respdto;

import lombok.Data;

@Data
public class VendorProductResponse {
    private Long id; // VendorProduct mapping ID
    private Long productId;
    private String productName;
    private Double sellingPrice;
    private Double originalPrice;
    private Integer stock;
    private Double discount;
}

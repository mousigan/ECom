package com.example.backend.dto.respdto;

import lombok.Data;

@Data
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Integer quantity;
    private Double price;
    private String vendorName;
    private String status;
}

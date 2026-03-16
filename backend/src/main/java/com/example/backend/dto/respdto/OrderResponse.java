package com.example.backend.dto.respdto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String orderStatus;
    private String shippingAddress;
    private java.util.List<OrderItemResponse> items;
}
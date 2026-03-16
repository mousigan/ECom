package com.example.backend.service;

import com.example.backend.dto.requestdto.OrderRequest;
import com.example.backend.dto.respdto.OrderResponse;


public interface OrderService {
    OrderResponse createOrder(OrderRequest request, Long userId);
    void awardCreditPoints(Long userId, Double totalAmount, boolean pointsUsed);
    java.util.List<OrderResponse> getUserOrders(Long userId);
    void deleteAllOrders();
    void updateOrderItemStatus(Long itemId, String status);
    void updateOrderStatus(Long orderId, String status);
    void cancelOrder(Long orderId, Long userId);
    java.util.List<OrderResponse> getVendorOrders(Long vendorId);
    java.util.List<OrderResponse> getAllOrders();
}
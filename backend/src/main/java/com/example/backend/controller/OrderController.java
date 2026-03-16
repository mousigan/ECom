package com.example.backend.controller;

import com.example.backend.dto.requestdto.OrderRequest;
import com.example.backend.dto.respdto.OrderResponse;
import com.example.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<OrderResponse> createOrder(
            @PathVariable Long userId,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request, userId);
        return ResponseEntity.ok(response);
    }

   @GetMapping("/{userId}")
public ResponseEntity<java.util.List<OrderResponse>> getUserOrders(
        @PathVariable Long userId) {

    return ResponseEntity.ok(orderService.getUserOrders(userId));
}

    @DeleteMapping("/reset")
    public ResponseEntity<String> resetOrders() {
        orderService.deleteAllOrders();
        return ResponseEntity.ok("All orders deleted and stocks reset to 20");
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<java.util.List<OrderResponse>> getVendorOrders(@PathVariable Long vendorId) {
        return ResponseEntity.ok(orderService.getVendorOrders(vendorId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<java.util.List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/item/{itemId}/status")
    public ResponseEntity<String> updateOrderItemStatus(@PathVariable Long itemId, @RequestParam String status) {
        orderService.updateOrderItemStatus(itemId, status);
        return ResponseEntity.ok("Item status updated to " + status);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<String> updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok("Order status updated to " + status);
    }

    @PostMapping("/{orderId}/cancel/{userId}")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId, @PathVariable Long userId) {
        orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok("Order cancelled successfully");
    }
}
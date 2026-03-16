package com.example.backend.dto.requestdto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class OrderRequest {
    @NotNull(message = "Total amount is required")
    @Min(value = 0, message = "Total amount cannot be negative")
    private Double totalAmount;
    private boolean pointsUsed;
    private List<OrderItemRequest> items;

    public boolean isPointsUsed() {
        return pointsUsed;
    }

    public void setPointsUsed(boolean pointsUsed) {
        this.pointsUsed = pointsUsed;
    }

    public OrderRequest() {
    }

    public OrderRequest(Double totalAmount, List<OrderItemRequest> items) {
        this.totalAmount = totalAmount;
        this.items = items;
    }

    // Getters and Setters
    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    private String shippingAddress;

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
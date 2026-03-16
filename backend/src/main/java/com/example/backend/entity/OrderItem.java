package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;
    private Double priceAtPurchase;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    private String status;

    public OrderItem(Integer quantity, Double priceAtPurchase, Order order, Product product, User vendor) {
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
        this.order = order;
        this.product = product;
        this.vendor = vendor;
        this.status = status;

    }
}
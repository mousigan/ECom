package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vendor_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Double sellingPrice;
    private Integer stock;
    private Double discount;
}

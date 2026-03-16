package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private String category;
    
    @Column(length = 1000)
    private String description;
    
    private Double price; // Recommended Retail Price
    private Double rating;
    private String thumbnail;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    private String tryOnModelUrl;
    private Integer ecoScore;

    @ElementCollection
    @CollectionTable(name = "product_specifications", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "spec_key")
    @Column(name = "spec_value")
    private Map<String, String> specifications = new HashMap<>();
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/main

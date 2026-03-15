package com.example.backend.dto.requestdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String brand;
    private String category;
    private String description;
    private String thumbnail;
    private List<String> images;
    private Double price;
    private Integer stock;
    private Integer ecoScore;
    private String tryOnModelUrl;
    private Map<String, String> specifications;
}
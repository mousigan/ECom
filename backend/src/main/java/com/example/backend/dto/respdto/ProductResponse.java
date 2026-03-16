 package com.example.backend.dto.respdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String brand;
    private String category;
    private String description;
    private Double price;
    private Double rating;
    private String thumbnail;
    private List<String> images;
    private Integer ecoScore;
    private String tryOnModelUrl;
    private Map<String, String> specifications;
    private String vendorName;
    private Long vendorId;
    private Double vendorRating;
    private Integer stock;
}
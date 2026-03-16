package com.example.backend.dto.external;

import java.util.List;

public class DummyProduct {
    private String title;
    private String description;
    private Double price;
    private Double rating;
    private String brand;
    private String category;
    private String thumbnail;
    private List<String> images;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}

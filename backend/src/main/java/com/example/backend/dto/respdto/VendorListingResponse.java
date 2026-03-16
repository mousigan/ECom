package com.example.backend.dto.respdto;

public class VendorListingResponse {
    private Long vendorId;
    private String vendorName;
    private Double vendorRating;
    private Double sellingPrice;
    private Integer stock;
    private Double discount;

    public VendorListingResponse() {
    }

    // Getters and Setters
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public Double getVendorRating() { return vendorRating; }
    public void setVendorRating(Double vendorRating) { this.vendorRating = vendorRating; }
    public Double getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }
}

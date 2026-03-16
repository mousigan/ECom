package com.example.backend.dto.external;
import java.util.List;

public class DummyProductResponse {
    private List<DummyProduct> products;
    private Integer total;
    private Integer skip;
    private Integer limit;

    // Getters and Setters
    public List<DummyProduct> getProducts() { return products; }
    public void setProducts(List<DummyProduct> products) { this.products = products; }
    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
    public Integer getSkip() { return skip; }
    public void setSkip(Integer skip) { this.skip = skip; }
    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }
}
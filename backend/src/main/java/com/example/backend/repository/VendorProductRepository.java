package com.example.backend.repository;

import com.example.backend.entity.VendorProduct;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface VendorProductRepository extends JpaRepository<VendorProduct, Long> {
    List<VendorProduct> findByVendorId(Long vendorId);
    List<VendorProduct> findByProductId(Long productId);
    Optional<VendorProduct> findByVendorAndProduct(User vendor, Product product);
    
    @Query("SELECT DISTINCT vp.product FROM VendorProduct vp")
    List<Product> findAvailableProducts();

    @Query("SELECT DISTINCT vp.product FROM VendorProduct vp WHERE vp.product.category = :category")
    List<Product> findAvailableProductsByCategory(String category);
}

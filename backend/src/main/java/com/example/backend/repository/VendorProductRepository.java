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
    Optional<VendorProduct> findByProductIdAndVendorId(Long productId, Long vendorId);
    List<VendorProduct> findByProduct_Id(Long productId);
    
    @Query("SELECT vp FROM VendorProduct vp JOIN FETCH vp.product JOIN FETCH vp.vendor")
    List<VendorProduct> findAvailableProducts();

    @Query("SELECT vp FROM VendorProduct vp JOIN FETCH vp.product JOIN FETCH vp.vendor WHERE vp.product.category = :category")
    List<VendorProduct> findAvailableProductsByCategory(String category);

    @Query("SELECT vp FROM VendorProduct vp JOIN FETCH vp.product JOIN FETCH vp.vendor " +
           "WHERE (:category IS NULL OR :category = '' OR LOWER(vp.product.category) = LOWER(:category)) " +
           "AND (:search IS NULL OR :search = '' " +
           "OR LOWER(vp.product.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(vp.product.brand) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(vp.product.category) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(vp.vendor.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<VendorProduct> searchAvailableProducts(@org.springframework.data.repository.query.Param("category") String category, 
                                               @org.springframework.data.repository.query.Param("search") String search);
}

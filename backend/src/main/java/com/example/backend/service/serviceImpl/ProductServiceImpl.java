package com.example.backend.service.serviceImpl;

import com.example.backend.dto.requestdto.ProductRequest;
import com.example.backend.dto.requestdto.VendorProductRequest;
import com.example.backend.dto.respdto.*;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.entity.VendorProduct;
import com.example.backend.repository.*;
import com.example.backend.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorProductRepository vendorProductRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRatingRepository vendorRatingRepository;

    public ProductServiceImpl(ProductRepository productRepository, 
                              UserRepository userRepository,
                              VendorProductRepository vendorProductRepository,
                              CategoryRepository categoryRepository,
                              VendorRatingRepository vendorRatingRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorProductRepository = vendorProductRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRatingRepository = vendorRatingRepository;
    }

    @Override
    public List<ProductResponse> getMarketplaceProducts(String category, String search) {
        List<Product> products;
        if (category != null && !category.isEmpty()) {
            products = vendorProductRepository.findAvailableProductsByCategory(category);
        } else {
            products = vendorProductRepository.findAvailableProducts();
        }
        
        if (search != null && !search.isEmpty()) {
            String lowerSearch = search.toLowerCase();
            products = products.stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(lowerSearch)) || 
                             (p.getBrand() != null && p.getBrand().toLowerCase().contains(lowerSearch)))
                .collect(Collectors.toList());
        }
        
        return products.stream().map(this::mapToProductResponse).collect(Collectors.toList());
    }

    @Override
    public ProductDetailResponse getProductDetails(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        List<VendorListingResponse> vendors = vendorProductRepository.findByProductId(productId)
                .stream().map(vp -> {
                    VendorListingResponse vlr = new VendorListingResponse();
                    vlr.setVendorId(vp.getVendor().getId());
                    vlr.setVendorName(vp.getVendor().getName());
                    vlr.setSellingPrice(vp.getSellingPrice());
                    vlr.setStock(vp.getStock());
                    vlr.setDiscount(vp.getDiscount());
                    vlr.setVendorRating(vendorRatingRepository.getAverageRatingForVendor(vp.getVendor().getId()));
                    return vlr;
                }).collect(Collectors.toList());
        
        return new ProductDetailResponse(mapToProductResponse(product), vendors);
    }

    @Override
    @Transactional
    public void addVendorProduct(Long vendorId, ProductRequest request) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        // Create the core Product
        Product product = new Product();
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setThumbnail(request.getThumbnail());
        product.setImages(request.getImages());
        product.setPrice(request.getPrice()); // Recommended Price
        product.setRating(5.0); // Initial rating
        product.setEcoScore(request.getEcoScore());
        product.setTryOnModelUrl(request.getTryOnModelUrl());
        product.setSpecifications(request.getSpecifications());
        
        Product savedProduct = productRepository.save(product);

        // Create the Vendor-specific listing
        VendorProduct vp = new VendorProduct();
        vp.setVendor(vendor);
        vp.setProduct(savedProduct);
        vp.setSellingPrice(request.getPrice());
        vp.setStock(request.getStock());
        vp.setDiscount(0.0);
        
        vendorProductRepository.save(vp);
    }

    @Override
    public List<VendorProductResponse> getVendorInventory(Long vendorId) {
        return vendorProductRepository.findByVendorId(vendorId)
                .stream().map(vp -> {
                    VendorProductResponse vpr = new VendorProductResponse();
                    vpr.setId(vp.getId());
                    vpr.setProductId(vp.getProduct().getId());
                    vpr.setProductName(vp.getProduct().getName());
                    vpr.setSellingPrice(vp.getSellingPrice());
                    vpr.setStock(vp.getStock());
                    vpr.setDiscount(vp.getDiscount());
                    return vpr;
                }).collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> compareProducts(List<Long> productIds) {
        return productRepository.findAllById(productIds)
                .stream().map(this::mapToProductResponse).collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getSlug()))
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product p) {
        ProductResponse pr = new ProductResponse();
        pr.setId(p.getId());
        pr.setName(p.getName());
        pr.setBrand(p.getBrand());
        pr.setCategory(p.getCategory());
        pr.setDescription(p.getDescription());
        pr.setPrice(p.getPrice());
        pr.setRating(p.getRating());
        pr.setThumbnail(p.getThumbnail());
        pr.setImages(p.getImages());
        pr.setEcoScore(p.getEcoScore());
        pr.setTryOnModelUrl(p.getTryOnModelUrl());
        pr.setSpecifications(p.getSpecifications());
        return pr;
    }
}

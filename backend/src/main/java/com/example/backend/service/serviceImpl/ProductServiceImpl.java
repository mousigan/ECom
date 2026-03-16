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
    private final ReviewRepository reviewRepository;

    public ProductServiceImpl(ProductRepository productRepository, 
                              UserRepository userRepository,
                              VendorProductRepository vendorProductRepository,
                              CategoryRepository categoryRepository,
                              VendorRatingRepository vendorRatingRepository,
                              ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorProductRepository = vendorProductRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRatingRepository = vendorRatingRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public List<ProductResponse> getMarketplaceProducts(String category, String search) {
        List<VendorProduct> listings;
        
        if ((search != null && !search.isEmpty()) || (category != null && !category.isEmpty())) {
            listings = vendorProductRepository.searchAvailableProducts(category, search);
        } else {
            listings = vendorProductRepository.findAvailableProducts();
        }

        // Batch fetch ratings to solve N+1 Problem
        List<Long> vendorIds = listings.stream()
            .map(vp -> vp.getVendor().getId())
            .distinct()
            .collect(Collectors.toList());
        
        // We can create a simple map of VendorId -> Rating
        java.util.Map<Long, Double> ratingMap = new java.util.HashMap<>();
        for (Long vid : vendorIds) {
            ratingMap.put(vid, vendorRatingRepository.getAverageRatingForVendor(vid));
        }
        
        return listings.stream()
            .map(vp -> mapListingToProductResponse(vp, ratingMap.get(vp.getVendor().getId())))
            .collect(Collectors.toList());
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

        List<ReviewResponse> reviews = reviewRepository.findByProductId(productId).stream()
                .map(r -> new ReviewResponse(r.getId(), r.getRating(), r.getComment(), r.getUser().getName(), r.getUser().getId()))
                .collect(Collectors.toList());
        
        return new ProductDetailResponse(mapToProductResponse(product), vendors, reviews);
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
    @Transactional
    public void updateVendorProduct(Long vendorProductId, VendorProductRequest request) {
        VendorProduct vp = vendorProductRepository.findById(vendorProductId)
                .orElseThrow(() -> new RuntimeException("Vendor product listing not found"));
        
        vp.setSellingPrice(request.getSellingPrice());
        vp.setStock(request.getStock());
        vp.setDiscount(request.getDiscount());
        
        vendorProductRepository.save(vp);
    }

    @Override
    @Transactional
    public void deleteVendorProduct(Long vendorProductId) {
        if (!vendorProductRepository.existsById(vendorProductId)) {
            throw new RuntimeException("Vendor product listing not found");
        }
        vendorProductRepository.deleteById(vendorProductId);
    }

    @Override
    public List<VendorProductResponse> getVendorInventory(Long vendorId) {
        return vendorProductRepository.findByVendorId(vendorId)
                .stream().map(vp -> {
                    VendorProductResponse vpr = new VendorProductResponse();
                    vpr.setId(vp.getId());
                    vpr.setProductId(vp.getProduct().getId());
                    vpr.setProductName(vp.getProduct().getName());
                    vpr.setOriginalPrice(vp.getProduct().getPrice());
                    vpr.setSellingPrice(vp.getSellingPrice());
                    vpr.setStock(vp.getStock());
                    vpr.setDiscount(vp.getDiscount());
                    return vpr;
                }).collect(Collectors.toList());
    }

    @Override
    public List<ProductDetailResponse> compareProducts(List<Long> productIds) {
        return productIds.stream()
                .map(this::getProductDetails)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getSlug()))
                .collect(Collectors.toList());
    }

    private ProductResponse mapListingToProductResponse(VendorProduct vp, Double averageRating) {
        ProductResponse pr = mapToProductResponse(vp.getProduct());
        pr.setVendorName(vp.getVendor().getName());
        pr.setVendorId(vp.getVendor().getId());
        pr.setVendorRating(averageRating != null ? averageRating : 0.0);
        pr.setStock(vp.getStock());
        pr.setPrice(vp.getSellingPrice());
        return pr;
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
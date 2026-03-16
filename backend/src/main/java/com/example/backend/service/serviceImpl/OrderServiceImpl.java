package com.example.backend.service.serviceImpl;
import com.example.backend.dto.requestdto.OrderRequest;
import com.example.backend.dto.requestdto.OrderItemRequest;
import com.example.backend.dto.respdto.OrderResponse;
import com.example.backend.dto.respdto.OrderItemResponse;

import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.Product;
import com.example.backend.entity.VendorProduct;
import com.example.backend.entity.User;

import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.VendorProductRepository;

import com.example.backend.service.OrderService;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final VendorProductRepository vendorProductRepository;
    private final ProductRepository productRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    public OrderServiceImpl(OrderRepository orderRepository, 
                            OrderItemRepository orderItemRepository,
                            UserRepository userRepository, 
                            VendorProductRepository vendorProductRepository,
                            ProductRepository productRepository,
                            org.springframework.mail.javamail.JavaMailSender mailSender) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.vendorProductRepository = vendorProductRepository;
        this.productRepository = productRepository;
        this.mailSender = mailSender;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(request.getTotalAmount());
        order.setShippingAddress(request.getShippingAddress());
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        // ✅ Save OrderItems
        List<OrderItemRequest> items = request.getItems();
        if (items != null) {
            for (OrderItemRequest itemReq : items) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setPriceAtPurchase(product.getPrice());
                orderItem.setStatus("PENDING");

                if (itemReq.getVendorId() != null) {
                    userRepository.findById(itemReq.getVendorId()).ifPresent(orderItem::setVendor);
                }
                
                orderItemRepository.save(orderItem);
            }
        }

        awardCreditPoints(userId, request.getTotalAmount(), request.isPointsUsed());

        // 📧 Send Personalized Confirmation Email
        sendOrderConfirmationEmail(user, savedOrder);

        return mapToOrderResponse(savedOrder);
    }

    private void sendOrderConfirmationEmail(User user, Order order) {
        try {
            int earnedPoints = (int) (order.getTotalAmount() / 1000) * 3;
            String tier = (user.getCreditPoints() >= 500) ? "🥇 Gold Tier Member" : 
                          (user.getCreditPoints() >= 100) ? "🥈 Silver Tier Member" : "🥉 Bronze Tier Member";

            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);
            
            helper.setTo(user.getEmail());
            helper.setSubject("🛍️ Order Confirmed! You've earned " + earnedPoints + " XP - Order #" + order.getId());
            
            StringBuilder content = new StringBuilder();
            content.append("<div style='font-family: \"Segoe UI\", Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f6; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>");
            
            // Header Gradient
            content.append("<div style='background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); padding: 40px 20px; text-align: center; color: white;'>");
            content.append("<h1 style='margin: 0; font-size: 28px; font-weight: 800;'>Sweet! Order Confirmed.</h1>");
            content.append("<p style='margin: 10px 0 0; opacity: 0.9;'>Order #").append(order.getId()).append(" • ").append(tier).append("</p>");
            content.append("</div>");

            content.append("<div style='padding: 30px;'>");
            content.append("<h2 style='color: #1e293b; margin-top: 0;'>🎉 High Five, ").append(user.getName()).append("!</h2>");
            content.append("<p style='color: #64748b; line-height: 1.6;'>Your order is officially confirmed! Our vendors are already busy preparing your items. You've earned <strong style='color: #6366f1;'>+").append(earnedPoints).append(" Reward XP</strong>—thank you for being a part of our sustainable community!</p>");
            
            // Invoice Table
            content.append("<div style='margin-top: 30px; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px;'>");
            content.append("<h3 style='margin-top: 0; font-size: 16px; color: #1e293b;'>Order Items</h3>");
            content.append("<table style='width: 100%; border-collapse: collapse;'>");
            
            for (OrderItem item : order.getOrderItems()) {
                String category = item.getProduct().getCategory();
                String catDisplay = (category != null) ? category.toUpperCase() : "ITEM";
                
                content.append("<tr>");
                content.append("<td style='padding: 15px 0; border-bottom: 1px solid #f8fafc; color: #334155;'>");
                content.append("<div style='font-size: 10px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;'>").append(catDisplay).append("</div>");
                content.append("<strong>").append(item.getProduct().getName()).append("</strong><br/>");
                content.append("<span style='font-size: 12px; color: #94a3b8;'>Quantity: ").append(item.getQuantity()).append("</span>");
                content.append("</td>");
                content.append("<td style='text-align: right; padding: 15px 0; border-bottom: 1px solid #f8fafc; font-weight: 800; color: #1e293b;'>₹").append(String.format("%.2f", item.getPriceAtPurchase() * item.getQuantity())).append("</td>");
                content.append("</tr>");
            }
            
            content.append("</table>");
            content.append("<div style='margin-top: 20px; padding-top: 15px; border-top: 2px dashed #f1f5f9; text-align: right;'>");
            content.append("<span style='font-size: 14px; color: #64748b; font-weight: 600;'>Grand Total:</span>");
            content.append("<div style='font-size: 24px; font-weight: 900; color: #6366f1;'>₹").append(String.format("%.2f", order.getTotalAmount())).append("</div>");
            content.append("</div>");
            content.append("</div>");
            
            // Shipping Info
            if (order.getShippingAddress() != null) {
                content.append("<div style='margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 16px; border-left: 5px solid #6366f1;'>");
                content.append("<p style='margin: 0; font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase;'>SHIPPING TO</p>");
                content.append("<p style='margin: 8px 0 0; color: #1e293b; font-size: 15px; line-height: 1.5;'>").append(order.getShippingAddress()).append("</p>");
                content.append("</div>");
            }
            
            content.append("<div style='margin-top: 40px; text-align: center; background: #fafafa; padding: 20px; border-radius: 16px;'>");
            content.append("<p style='font-size: 13px; color: #64748b; margin: 0;'>Stay awesome and thank you for choosing ECOM PRO!</p>");
            content.append("<p style='font-size: 11px; color: #cbd5e1; margin-top: 12px;'>Need help? Reply to this email and we'll be there.</p>");
            content.append("</div>");

            content.append("</div></div>");
            
            helper.setText(content.toString(), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send order email: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void awardCreditPoints(Long userId, Double totalAmount, boolean pointsUsed) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (pointsUsed) {
            user.setCreditPoints(0);
        }

        // For every thousand spends, 3 credit points added
        int earnedPoints = (int) (totalAmount / 1000) * 3;
        user.setCreditPoints(user.getCreditPoints() + earnedPoints);
        
        userRepository.save(user);
    }

    @Override
    public java.util.List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUser_IdOrderByOrderDateDesc(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void updateOrderItemStatus(Long itemId, String status) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));
        
        String oldStatus = item.getStatus();
        
        // Reliability Score & Stock Logic
        // Vendor Accepts -> VENDOR_ACCEPTED
        if ("VENDOR_ACCEPTED".equalsIgnoreCase(status) && !"VENDOR_ACCEPTED".equalsIgnoreCase(oldStatus)) {
            // 📦 Stock Deduction (Only happens once on vendor confirmation)
            VendorProduct vp = vendorProductRepository.findByProductIdAndVendorId(
                    item.getProduct().getId(), item.getVendor().getId())
                    .orElseThrow(() -> new RuntimeException("Vendor listing not found for stock deduction"));
            
            int newStock = vp.getStock() - item.getQuantity();
            if (newStock < 0) throw new RuntimeException("Insufficient stock to confirm order");
            vp.setStock(newStock);
            vendorProductRepository.save(vp);

            // ⭐ Reward Vendor (+10 XP)
            User vendor = item.getVendor();
            if (vendor != null) {
                vendor.setCreditPoints((vendor.getCreditPoints() != null ? vendor.getCreditPoints() : 0) + 10);
                userRepository.save(vendor);
            }
        }

        // ❌ Vendor Rejection -> CANCELLED_BY_VENDOR
        if ("CANCELLED_BY_VENDOR".equalsIgnoreCase(status) && !"CANCELLED_BY_VENDOR".equalsIgnoreCase(oldStatus)) {
            User vendor = item.getVendor();
            if (vendor != null) {
                int currentPoints = vendor.getCreditPoints() != null ? vendor.getCreditPoints() : 0;
                vendor.setCreditPoints(Math.max(0, currentPoints - 15)); // Penalty for cancelling on customer
                userRepository.save(vendor);
            }
        }
        
        item.setStatus(status);
        orderItemRepository.save(item);

        // Optionally update overall order status if all items are handled
        updateOrderStatusIfAllItemsHandled(item.getOrder().getId());
    }

    private void updateOrderStatusIfAllItemsHandled(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;

        boolean allAccepted = order.getOrderItems().stream()
                .allMatch(i -> "VENDOR_ACCEPTED".equals(i.getStatus()) || "SHIPPED".equals(i.getStatus()));
        
        if (allAccepted) {
            order.setOrderStatus("READY_FOR_SHIPMENT");
            orderRepository.save(order);
        }
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(status);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }

        if (!"PENDING".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Cannot cancel order once it is " + order.getOrderStatus());
        }

        // Check if any specific item has already been accepted/processed by a vendor
        boolean hasProcessedItem = order.getOrderItems().stream()
                .anyMatch(item -> !"PENDING".equalsIgnoreCase(item.getStatus()));
        
        if (hasProcessedItem) {
            throw new RuntimeException("Cannot cancel order because a vendor has already accepted part of it.");
        }

        order.setOrderStatus("CANCELLED_BY_USER");
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> item.setStatus("CANCELLED_BY_USER"));
        }
        orderRepository.save(order);
    }

    @Override
    public java.util.List<OrderResponse> getVendorOrders(Long vendorId) {
        // Find all orders that have at least one item from this vendor
        return orderRepository.findAll().stream()
                .filter(o -> o.getOrderItems().stream().anyMatch(i -> i.getVendor() != null && i.getVendor().getId().equals(vendorId)))
                .map(this::mapToOrderResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public java.util.List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAllOrders() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        
        // Optional: Reset all vendor product stocks to a default value (e.g. 20) for fresh testing
        List<VendorProduct> allListings = vendorProductRepository.findAll();
        for (VendorProduct vp : allListings) {
            vp.setStock(20);
            vendorProductRepository.save(vp);
        }
        
        System.out.println("🧹 Database cleaned: All orders removed and stocks reset to 20.");
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderStatus(order.getOrderStatus());
        response.setShippingAddress(order.getShippingAddress());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream().map(item -> {
            OrderItemResponse ir = new OrderItemResponse();
            ir.setId(item.getId());
            ir.setProductId(item.getProduct().getId());
            ir.setProductName(item.getProduct().getName());
            ir.setProductThumbnail(item.getProduct().getThumbnail());
            ir.setQuantity(item.getQuantity());
            ir.setPrice(item.getPriceAtPurchase());
            ir.setStatus(item.getStatus());
            if (item.getVendor() != null) ir.setVendorName(item.getVendor().getName());
            return ir;
        }).collect(java.util.stream.Collectors.toList());
        
        response.setItems(itemResponses);
        return response;
    }
}
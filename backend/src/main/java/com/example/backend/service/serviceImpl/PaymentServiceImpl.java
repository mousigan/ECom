package com.example.backend.service.serviceImpl;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.example.backend.dto.respdto.PaymentResponse;
import com.example.backend.service.PaymentService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    @Override
    public PaymentResponse createPaymentIntent(Double amount, String currency) {
        System.out.println("💳 Creating PaymentIntent for: " + amount + " " + currency);
        try {
            // Convert to smallest currency unit (e.g., cents/paise)
            long amountInSmallestUnit = (long) (amount * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInSmallestUnit)
                    .setCurrency(currency)
                    .setDescription("E-commerce Product Purchase")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            System.out.println("✅ PaymentIntent Created: " + intent.getId());

            PaymentResponse response = new PaymentResponse();
            response.setClientSecret(intent.getClientSecret());
            response.setStatus("SUCCESS");
            return response;
        } catch (StripeException e) {
            System.err.println("❌ Stripe Error: " + e.getMessage());
            PaymentResponse response = new PaymentResponse();
            response.setStatus("FAILED: " + e.getMessage());
            return response;
        }
    }
}
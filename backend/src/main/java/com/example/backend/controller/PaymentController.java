package com.example.backend.controller;

import com.example.backend.service.PaymentService;
import com.example.backend.dto.requestdto.PaymentRequest;
import com.example.backend.dto.respdto.PaymentResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPaymentIntent(request.getAmount(), request.getCurrency());
        return ResponseEntity.ok(response);
    }
}
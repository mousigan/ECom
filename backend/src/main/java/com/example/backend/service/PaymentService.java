package com.example.backend.service;

import com.example.backend.dto.respdto.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPaymentIntent(Double amount, String currency);

}
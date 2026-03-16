package com.example.backend.dto.respdto;

public class PaymentResponse {
    private String clientSecret;
    private String status;

    public PaymentResponse() {
    }

    public PaymentResponse(String clientSecret, String status) {
        this.clientSecret = clientSecret;
        this.status = status;
    }

    // Getters and Setters
    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
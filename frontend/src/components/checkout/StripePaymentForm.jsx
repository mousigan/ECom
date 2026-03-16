import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ finalAmount, pointsUsed }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        // Prevent default form action
        e.preventDefault();

        // Check if stripe and elements are loaded
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirect on success with paid amount info
                return_url: `${window.location.origin}/payment-success?paidAmount=${finalAmount}&pointsUsed=${pointsUsed}`,
            },
        });

        // Error handling (e.g., card declined)
        if (error) {
            setErrorMessage(error.message);
        }

        setIsProcessing(false);
    };

    const containerStyle = {
        padding: '20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    };

    const buttonStyle = {
        marginTop: '20px',
        width: '100%',
        padding: '12px',
        backgroundColor: isProcessing || !stripe ? '#94a3b8' : '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: isProcessing || !stripe ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <button 
                    disabled={isProcessing || !stripe} 
                    type="submit" 
                    style={buttonStyle}
                >
                    {isProcessing ? "Processing..." : "Pay Now"}
                </button>
                {errorMessage && (
                    <div style={{ color: '#ef4444', marginTop: '15px', fontSize: '14px', textAlign: 'center' }}>
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
};

export default StripePaymentForm;

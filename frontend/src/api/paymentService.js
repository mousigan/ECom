import axiosInstance from './axiosConfig';

export const createPaymentIntent = async (amount, currency) => {
  try {
    const response = await axiosInstance.post('/payment/create-intent', {
      amount,
      currency,
    });
    return response.data; // Response includes clientSecret
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

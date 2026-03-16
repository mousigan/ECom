import axiosInstance from './axiosConfig';

/**
 * Creates a new order for a user.
 * Note: This endpoint implicitly triggers credit point rewards on the backend
 * (totalAmount / 100) as part of the order processing logic.
 */
export const createOrder = async (userId, orderData) => {
  try {
    const response = await axiosInstance.post(`/orders/${userId}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error creating order for user ${userId}:`, error);
    throw error;
  }
};

import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's orders with pagination
  getMyOrders: async (page = 1) => {
    try {
      const response = await api.get('/orders/my-orders', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (id) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;

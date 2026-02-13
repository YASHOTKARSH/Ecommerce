import api from './api';

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart', {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update cart item quantity
  updateCart: async (productId, quantity) => {
    try {
      const response = await api.put('/cart', {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default cartService;

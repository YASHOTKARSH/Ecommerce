import api from './api';

const productService = {
  // Get all products with optional filters
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await api.get('/products', {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Create new product
  createProduct: async (productData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(productData).forEach((key) => {
        if (key === 'images' && productData[key]) {
          // Handle multiple images
          if (Array.isArray(productData[key])) {
            productData[key].forEach((image) => {
              formData.append('images', image);
            });
          } else {
            formData.append('images', productData[key]);
          }
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(productData).forEach((key) => {
        if (key === 'images' && productData[key]) {
          // Handle multiple images
          if (Array.isArray(productData[key])) {
            productData[key].forEach((image) => {
              formData.append('images', image);
            });
          } else {
            formData.append('images', productData[key]);
          }
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default productService;

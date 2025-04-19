import axios from 'axios';
import { toast } from 'sonner';

const baseURL = 'http://localhost:5234/api';

console.log('API Base URL:', baseURL);

// Create a base API client without auth headers
export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Create an authenticated API client that includes auth headers
export const authenticatedApiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Add request interceptor to authenticated client to add auth token
authenticatedApiClient.interceptors.request.use(
  (config) => {
    // Try to get user token first
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const { token } = JSON.parse(user);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }

    // If no user token, try admin token
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
authenticatedApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Received 401 response, clearing auth state');
      localStorage.removeItem('user');
      delete authenticatedApiClient.defaults.headers.common['Authorization'];
      
      // Only show the toast if we're not on the home page
      if (window.location.pathname !== '/') {
        toast.error('Session expired. Please sign in again.');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Add logging interceptors for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

authenticatedApiClient.interceptors.request.use(
  (config) => {
    console.log('Authenticated API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Authenticated API Request Error:', error);
    return Promise.reject(error);
  }
);

authenticatedApiClient.interceptors.response.use(
  (response) => {
    console.log('Authenticated API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Authenticated API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getProducts: async (brandId: number, params?: any) => {
    const response = await apiClient.get(`/brands/${brandId}/products`, { params });
    return response.data;
  },

  search: async (query: string, params?: any) => {
    const response = await apiClient.get('/products/search', { 
      params: { query, ...params } 
    });
    return response.data;
  },

  getByCategory: async (categoryId: number) => {
    const response = await apiClient.get(`/products/category/${categoryId}`);
    return response.data;
  },

  getByColor: async (color: string) => {
    const response = await apiClient.get(`/products/color/${color}`);
    return response.data;
  },

  getByMaterial: async (material: string) => {
    const response = await apiClient.get(`/products/material/${material}`);
    return response.data;
  },

  getEditorsPick: async (limit?: number) => {
    try {
      const response = await apiClient.get('/products/editors-pick', { 
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching editor\'s pick:', error);
      return []; // Return empty array on error
    }
  },

  getTrending: async (params?: { limit?: number; page?: number; isHomePage?: boolean }) => {
    try {
      const response = await apiClient.get('/products/trending', { 
        params: {
          ...params,
          isHomePage: params?.isHomePage || false
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return { Items: [], TotalItems: 0, TotalPages: 0, CurrentPage: 1, PageSize: 20 };
    }
  },

  trackClick: async (id: number) => {
    const response = await apiClient.post(`/products/${id}/click`);
    return response.data;
  },

  getRecommendations: async (id: number, limit?: number) => {
    const response = await apiClient.get(`/products/${id}/recommendations`, { 
      params: { limit } 
    });
    return response.data;
  },

  getLikedProducts: async () => {
    try {
      const response = await authenticatedApiClient.get('/products/liked');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      console.error('Error fetching liked products:', error);
      return [];
    }
  },

  checkIfLiked: async (productId: number) => {
    try {
      const response = await authenticatedApiClient.get(`/products/${productId}/like`);
      return response.data.isLiked || false;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      console.error('Error checking if product is liked:', error);
      return false;
    }
  },

  toggleLike: async (productId: number) => {
    try {
      const response = await authenticatedApiClient.post(`/products/${productId}/like`);
      return response.data.isLiked || false;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      console.error('Error toggling product like:', error);
      throw error;
    }
  },

  getByBrand: async (brandName: string, params?: any) => {
    const response = await apiClient.get(`/products/brand/${encodeURIComponent(brandName)}`, { params });
    return response.data;
  }
};

// Brands API
export const brandsApi = {
  getAll: async () => {
    try {
      console.log('Fetching all brands...');
      const response = await apiClient.get('/brands');
      console.log('Brands API response:', response.data);
      
      // Transform the response to match the expected format
      const transformedData = Array.isArray(response.data) ? response.data.map((brand: any) => ({
        id: brand.ID || brand.id,
        name: brand.Name || brand.name,
        websiteURL: brand.WebsiteURL || brand.websiteURL
      })) : [];
      
      console.log('Transformed brands:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Brands API error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/brands/${id}`);
    return response.data;
  },

  getProducts: async (id: number, params?: any) => {
    const response = await apiClient.get(`/brands/${id}/products`, { params });
    return response.data;
  },

  getTrending: async (limit?: number) => {
    const response = await apiClient.get('/brands/trending', { 
      params: { limit } 
    });
    return response.data;
  },

  search: async (query: string, params?: any) => {
    const response = await apiClient.get('/brands/search', { 
      params: { query, ...params } 
    });
    return response.data;
  }
};

// Categories API
export const categoriesApi = {
  getAll: async (gender?: string) => {
    try {
      console.log('Fetching all categories with gender:', gender);
      const response = await apiClient.get('/categories', {
        params: { gender }
      });
      console.log('Raw categories API response:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format: expected array but got:', typeof response.data);
        return [];
      }

      // Transform the response to match the expected format
      const transformedData = response.data.map((category: any) => {
        console.log('Processing category:', category);
        return {
          id: category.ID || category.id,
          name: category.Name || category.name,
          gender: category.Gender || category.gender,
          subcategories: Array.isArray(category.SubCategories || category.subcategories) 
            ? (category.SubCategories || category.subcategories).map((sub: any) => ({
                id: sub.ID || sub.id,
                name: sub.Name || sub.name,
                categoryId: sub.CategoryID || sub.categoryId
              }))
            : []
        };
      });
      
      console.log('Transformed categories:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Categories API error:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getById: async (id: number) => {
    try {
      console.log(`Fetching category with ID: ${id}`);
      const response = await apiClient.get(`/categories/${id}`);
      console.log('Category by ID response:', response.data);
      
      // Transform the response
      const category = response.data;
      return {
        id: category.ID || category.id,
        name: category.Name || category.name,
        gender: category.Gender || category.gender,
        subcategories: Array.isArray(category.SubCategories || category.subcategories)
          ? (category.SubCategories || category.subcategories).map((sub: any) => ({
              id: sub.ID || sub.id,
              name: sub.Name || sub.name,
              categoryId: sub.CategoryID || sub.categoryId
            }))
          : []
      };
    } catch (error) {
      console.error('Category by ID error:', error);
      return null;
    }
  },

  getProducts: async (id: number) => {
    try {
      console.log(`Fetching products for category ID: ${id}`);
      const response = await apiClient.get(`/categories/${id}/products`);
      console.log('Category products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Category products error:', error);
      return [];
    }
  }
};

// Export API
export const exportApi = {
  getAdminBrands: async () => {
    try {
      const response = await apiClient.get('/export/admin/brands', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_brands.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error exporting all brands:', error);
      toast.error(error.response?.data || 'Failed to export brands');
      throw error;
    }
  },

  getBrandById: async (brandId: number) => {
    try {
      if (!brandId || brandId <= 0) {
        throw new Error('Invalid brand ID');
      }

      const response = await apiClient.get(`/export/brands/${brandId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand_${brandId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error(`Error exporting brand ${brandId}:`, error);
      toast.error(error.response?.data || `Failed to export brand ${brandId}`);
      throw error;
    }
  },

  getBrandProducts: async (brandId: number) => {
    try {
      if (!brandId || brandId <= 0) {
        throw new Error('Invalid brand ID');
      }

      const response = await apiClient.get(`/export/brand/${brandId}/products`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand_${brandId}_products.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error(`Error exporting brand products ${brandId}:`, error);
      toast.error(error.response?.data || `Failed to export brand products ${brandId}`);
      throw error;
    }
  }
};

export default apiClient; 
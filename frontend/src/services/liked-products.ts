import { authenticatedApiClient } from '@/lib/api-client';

export interface LikedProduct {
  id: number;
  name: string;
  price: number;
  imageURL: string;
  description?: string;
  discountedPrice?: number;
  color?: string;
  size?: string;
  material?: string;
  productURL?: string;
  clickCount: number;
  isEditorsPick: boolean;
  brand: {
    name: string;
  };
  category: {
    name: string;
    gender: string | null;
  };
  subCategory?: {
    name: string;
  };
}

export const likedProductsService = {
  getLikedProducts: async (): Promise<LikedProduct[]> => {
    try {
      console.log('Fetching liked products...');
      const response = await authenticatedApiClient.get('/products/liked');
      console.log('Liked products API response:', response.data);

      // Ensure the response is an array
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format - expected array:', response.data);
        return [];
      }

      // Map the response to match the LikedProduct interface
      const products = response.data.map((item: any): LikedProduct => {
        console.log('Processing liked product:', item);
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          imageURL: item.imageURL,
          description: item.description,
          discountedPrice: item.discountedPrice,
          color: item.color,
          size: item.size,
          material: item.material,
          productURL: item.productURL,
          clickCount: item.clickCount,
          isEditorsPick: item.isEditorsPick,
          brand: {
            name: item.brand?.name || 'Unknown Brand'
          },
          category: {
            name: item.category?.name || 'Unknown Category',
            gender: item.category?.gender || null
          },
          subCategory: item.subCategory ? {
            name: item.subCategory.name
          } : undefined
        };
      });

      console.log('Transformed liked products:', products);
      return products;
    } catch (error: any) {
      console.error('Error fetching liked products:', error);
      if (error.response?.status === 401) {
        return []; // Return empty array for unauthorized users
      }
      return [];
    }
  },

  checkIfLiked: async (productId: number): Promise<boolean> => {
    if (!productId) {
      console.error('Invalid product ID:', productId);
      return false;
    }

    try {
      console.log(`Checking if product ${productId} is liked...`);
      const response = await authenticatedApiClient.get(`/products/${productId}/like`);
      console.log(`Like status for product ${productId}:`, response.data);
      return response.data.isLiked || false;
    } catch (error: any) {
      console.error(`Error checking if product ${productId} is liked:`, {
        error,
        status: error.response?.status,
        data: error.response?.data
      });
      if (error.response?.status === 401) {
        return false; // Return false for unauthorized users
      }
      return false;
    }
  },

  toggleLike: async (productId: number): Promise<boolean> => {
    if (!productId) {
      console.error('Invalid product ID:', productId);
      return false;
    }

    try {
      console.log(`Toggling like for product ${productId}...`);
      const response = await authenticatedApiClient.post(`/products/${productId}/like`);
      console.log(`Toggle like response for product ${productId}:`, response.data);
      return response.data.isLiked || false;
    } catch (error: any) {
      console.error(`Error toggling like for product ${productId}:`, {
        error,
        status: error.response?.status,
        data: error.response?.data
      });
      if (error.response?.status === 401) {
        throw new Error('Unauthorized'); // Still throw for toggle since we need to show sign-in dialog
      }
      return false;
    }
  }
}; 
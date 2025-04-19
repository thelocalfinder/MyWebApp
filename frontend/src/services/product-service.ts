import { productsApi } from '@/lib/api-client';

interface BackendProduct {
  Id: number;
  Name: string;
  Description?: string;
  Price: number;
  DiscountedPrice?: number;
  ImageURL: string;
  Color?: string;
  Size?: string;
  Material?: string;
  ProductURL?: string;
  ClickCount: number;
  IsEditorsPick: boolean;
  BrandName: string;
  CategoryName: string;
  CategoryGender: string;
  SubCategoryName?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  imageURL: string;
  color?: string;
  size?: string;
  material?: string;
  productURL?: string;
  clickCount: number;
  likeCount: number;
  isEditorsPick: boolean;
  brand?: {
    name: string;
  };
  category?: {
    name: string;
    gender: string;
  };
  subCategory?: {
    name: string;
  };
}

function transformProduct(backendProduct: BackendProduct): Product {
  console.log('Transforming product:', backendProduct);
  const transformed = {
    id: backendProduct.Id,
    name: backendProduct.Name,
    description: backendProduct.Description,
    price: backendProduct.Price,
    discountedPrice: backendProduct.DiscountedPrice,
    imageURL: backendProduct.ImageURL,
    color: backendProduct.Color,
    size: backendProduct.Size,
    material: backendProduct.Material,
    productURL: backendProduct.ProductURL,
    clickCount: backendProduct.ClickCount,
    likeCount: 0,
    isEditorsPick: backendProduct.IsEditorsPick,
    brand: backendProduct.BrandName ? {
      name: backendProduct.BrandName
    } : undefined,
    category: backendProduct.CategoryName ? {
      name: backendProduct.CategoryName,
      gender: backendProduct.CategoryGender
    } : undefined,
    subCategory: backendProduct.SubCategoryName ? {
      name: backendProduct.SubCategoryName
    } : undefined
  };
  console.log('Transformed product:', transformed);
  return transformed;
}

export interface ProductFilters {
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'trending' | 'newest';
}

interface PaginatedResponse<T> {
  CurrentPage: number;
  PageSize: number;
  TotalItems: number;
  TotalPages: number;
  Items: T[];
}

export const productService = {
  // Get editor's pick products
  getEditorsPick: async (limit: number = 5): Promise<Product[]> => {
    try {
      console.log('Fetching editor\'s pick products with limit:', limit);
      const data = await productsApi.getEditorsPick(limit);
      console.log('Raw editor\'s pick data:', data);
      if (!Array.isArray(data)) {
        console.error('Editor\'s pick data is not an array:', data);
        return [];
      }
      const transformed = data.map(transformProduct);
      console.log('Transformed editor\'s pick products:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error fetching editor\'s pick products:', error);
      return [];
    }
  },

  // Get trending products
  getTrending: async (params?: { limit?: number; page?: number }): Promise<Product[]> => {
    try {
      console.log('Fetching trending products with params:', params);
      const response = await productsApi.getTrending({
        ...params,
        isHomePage: params?.limit === 5 // If limit is 5, it's for the home page
      });
      console.log('Raw trending data:', response);
      
      // Handle paginated response
      if (response && 'Items' in response) {
        const transformed = response.Items.map(transformProduct);
        console.log('Transformed trending products:', transformed);
        return transformed;
      }
      
      // Handle non-paginated response (for home page)
      if (Array.isArray(response)) {
        const transformed = response.map(transformProduct);
        console.log('Transformed trending products:', transformed);
        return transformed;
      }
      
      console.error('Unexpected trending data format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }
  },

  // Get products by subcategory
  getBySubCategory: async (subCategory: string, filters?: ProductFilters): Promise<Product[]> => {
    try {
      console.log('Fetching products by subcategory:', subCategory, 'with filters:', filters);
      
      // First try to get all products
      const response = await productsApi.getAll();
      console.log('All products response:', response);
      
      if (!response || typeof response !== 'object' || !('Items' in response)) {
        console.error('Invalid products response:', response);
        return [];
      }

      const paginatedResponse = response as PaginatedResponse<BackendProduct>;
      let data = paginatedResponse.Items;
      
      // Filter by category or subcategory name
      if (subCategory && data.length > 0) {
        const searchTerm = subCategory.toLowerCase().replace(/-/g, ' ');
        console.log('Searching for term:', searchTerm);
        
        data = data.filter(product => {
          const categoryName = (product.CategoryName || '').toLowerCase();
          const subCategoryName = (product.SubCategoryName || '').toLowerCase();
          
          const categoryMatch = categoryName === searchTerm;
          const subcategoryMatch = subCategoryName === searchTerm;
          
          console.log('Product match check:', {
            productName: product.Name,
            categoryName,
            subCategoryName,
            searchTerm,
            categoryMatch,
            subcategoryMatch
          });
          
          return categoryMatch || subcategoryMatch;
        });

        console.log(`Found ${data.length} products matching category/subcategory:`, searchTerm);
      }

      let transformedData = data.map(transformProduct);
      console.log('Transformed products:', transformedData);

      // Apply filters
      if (filters) {
        if (filters.minPrice !== undefined) {
          transformedData = transformedData.filter(product => product.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
          transformedData = transformedData.filter(product => product.price <= filters.maxPrice!);
        }
        if (filters.brands && filters.brands.length > 0) {
          transformedData = transformedData.filter(product => 
            product.brand && filters.brands!.includes(product.brand.name)
          );
        }
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price_asc':
              transformedData.sort((a, b) => (a.price || 0) - (b.price || 0));
              break;
            case 'price_desc':
              transformedData.sort((a, b) => (b.price || 0) - (a.price || 0));
              break;
            case 'newest':
              transformedData.sort((a, b) => b.id - a.id);
              break;
            case 'trending':
              transformedData.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
              break;
          }
        }
      }

      return transformedData;
    } catch (error) {
      console.error('Error in getBySubCategory:', error);
      return [];
    }
  },

  // Get product details
  getProductDetails: async (id: number): Promise<Product | null> => {
    try {
      return await productsApi.getById(id);
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  },

  // Get liked products
  getLikedProducts: async (): Promise<Product[]> => {
    try {
      const data = await productsApi.getLikedProducts();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching liked products:', error);
      return [];
    }
  },

  // Like/Unlike a product
  toggleLike: async (productId: number): Promise<boolean> => {
    try {
      await productsApi.toggleLike(productId);
      return true;
    } catch (error) {
      console.error('Error toggling product like:', error);
      return false;
    }
  },

  // Increment click count
  incrementClickCount: async (productId: number): Promise<boolean> => {
    try {
      await productsApi.trackClick(productId);
      return true;
    } catch (error) {
      console.error('Error incrementing click count:', error);
      return false;
    }
  },

  search: async (query: string, params?: {
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    sortBy?: string;
  }) => {
    try {
      console.log('Searching products with query:', query);
      const response = await productsApi.search(query, params);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  getByBrand: async (brandName: string, params?: {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => {
    try {
      console.log('Fetching products for brand:', brandName);
      const response = await productsApi.getByBrand(brandName, params);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by brand:', error);
      return [];
    }
  }
}; 
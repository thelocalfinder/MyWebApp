import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';
import { productsApi } from '@/lib/api-client';

interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageURL: string;
  brand: {
    name: string;
  };
  category: {
    name: string;
  };
  subCategory?: {
    name: string;
  };
  isEditorsPick: boolean;
}

interface ProductListProps {
  categoryId?: number;
  brandId?: number;
  color?: string;
  material?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export function ProductList({
  categoryId,
  brandId,
  color,
  material,
  sortBy = 'newest',
  sortOrder = 'desc',
  page = 1,
  pageSize = 20
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let response;
        if (categoryId) {
          response = await productsApi.getByCategory(categoryId);
        } else if (brandId) {
          response = await productsApi.getProducts(brandId, {
            sortBy,
            sortOrder,
            page,
            pageSize
          });
        } else if (color) {
          response = await productsApi.getByColor(color);
        } else if (material) {
          response = await productsApi.getByMaterial(material);
        } else {
          response = await productsApi.getAll({
            sortBy,
            sortOrder,
            page,
            pageSize
          });
        }

        setProducts(response.items || response);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, brandId, color, material, sortBy, sortOrder, page, pageSize]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          discountedPrice={product.discountedPrice}
          image={product.imageURL}
          brand={product.brand.name}
          category={product.category.name}
          subCategory={product.subCategory?.name}
          isEditorsPick={product.isEditorsPick}
        />
      ))}
    </div>
  );
} 
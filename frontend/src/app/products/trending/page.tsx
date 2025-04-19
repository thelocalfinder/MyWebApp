"use client"

import { useState, useEffect } from "react"
import { Loader2, TrendingUp } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/product-service"
import { Product } from "@/services/product-service"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 20

export default function TrendingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const response = await productService.getTrending({ page: currentPage })
        if (Array.isArray(response)) {
          setProducts(response)
        } else if (response && 'Items' in response) {
          setProducts(response.Items)
          setHasMore(response.CurrentPage < response.TotalPages)
        }
      } catch (error) {
        console.error('Error loading trending products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [currentPage])

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Trending Now</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <p className="text-lg font-medium text-blue-500">Hot & In Demand</p>
        </div>
        <p className="text-gray-600 leading-relaxed">
          Discover what's capturing everyone's attention right now. Our trending section showcases the most clicked and sought-after items across our collection. From fashion-forward pieces to timeless classics, these products represent what's hot in the world of style. Updated in real-time based on user engagement and popularity.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            discountedPrice={product.discountedPrice}
            imageURL={product.imageURL}
            brand={product.brand}
            category={product.category}
            subCategory={product.subCategory}
            isEditorsPick={product.isEditorsPick}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center mt-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} className="bg-blue-500 hover:bg-blue-600 text-white">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
} 
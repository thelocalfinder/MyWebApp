"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { useAuth } from "@/contexts/auth-context"
import { likedProductsService, LikedProduct } from "@/services/liked-products"
import { SignInDialog } from "@/components/sign-in-dialog"
import { Heart } from "lucide-react"
import { toast } from "sonner"

export default function LikedPage() {
  const { user, isAuthenticated } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLikedProducts = async () => {
    if (!isAuthenticated || !user) {
      setShowSignIn(true)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      console.log('Fetching liked products for user:', user.id)
      const products = await likedProductsService.getLikedProducts()
      console.log('Fetched liked products:', products)
      
      if (!Array.isArray(products)) {
        console.error('Invalid response format:', products)
        toast.error('Failed to load wishlist')
        return
      }
      
      // Filter out any products with undefined or duplicate IDs
      const validProducts = products.filter((product, index, self) => 
        product && 
        product.id !== undefined && 
        self.findIndex(p => p.id === product.id) === index
      )
      
      console.log('Valid products:', validProducts)
      setLikedProducts(validProducts)
    } catch (error: any) {
      console.error('Error fetching liked products:', error)
      if (error.message === 'Unauthorized') {
        setShowSignIn(true)
      } else {
        toast.error('Failed to load wishlist')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch liked products when the component mounts and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Auth state changed, fetching liked products...')
      fetchLikedProducts()
    }
  }, [isAuthenticated, user])

  // Also fetch when the page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user) {
        console.log('Page became visible, refreshing liked products...')
        fetchLikedProducts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, user])

  const handleLikeChange = (productId: number, isLiked: boolean) => {
    if (!isLiked) {
      // Remove the product if it was unliked
      setLikedProducts(prev => prev.filter(p => p.id !== productId))
    }
    // No need to add the product here since we're on the liked products page
    // If a product is liked, it will be added through the fetchLikedProducts call
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your wishlist</p>
          <button
            onClick={() => setShowSignIn(true)}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
        <SignInDialog 
          open={showSignIn} 
          onOpenChange={setShowSignIn}
          onSuccess={fetchLikedProducts}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      
      {likedProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Your wishlist is empty</p>
          <p className="text-gray-500 text-sm mt-2">Start adding products you love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likedProducts.map((product) => {
            console.log('Rendering product card:', product);
            return (
              <ProductCard
                key={`liked-${product.id}`}
                id={product.id}
                name={product.name}
                price={product.price}
                discountedPrice={product.discountedPrice}
                imageURL={product.imageURL || '/images/placeholder.jpg'}
                brand={product.brand}
                category={product.category}
                subCategory={product.subCategory}
                isEditorsPick={product.isEditorsPick}
                productURL={product.productURL}
                onLikeChange={(isLiked) => handleLikeChange(product.id, isLiked)}
              />
            );
          })}
        </div>
      )}
    </div>
  )
} 
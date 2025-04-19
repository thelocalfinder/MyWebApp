"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { SignInDialog } from "@/components/sign-in-dialog"
import { productsApi } from "@/lib/api-client"
import { likedProductsService } from "@/services/liked-products"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProductCardProps {
  id: number
  name: string
  price: number
  discountedPrice?: number
  imageURL: string
  brand?: {
    name: string
  }
  category?: {
    name: string
  }
  subCategory?: {
    name: string
  }
  isEditorsPick?: boolean
  productURL?: string
  onLikeChange?: (isLiked: boolean) => void
}

export function ProductCard({
  id,
  name,
  price,
  discountedPrice,
  imageURL,
  brand,
  category,
  subCategory,
  isEditorsPick,
  productURL,
  onLikeChange
}: ProductCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !id) {
        setIsLiked(false)
        return
      }

      try {
        const isLiked = await likedProductsService.checkIfLiked(id)
        setIsLiked(isLiked)
      } catch (error: any) {
        console.error('Error checking like status:', error)
        if (error.message === 'Unauthorized') {
          setIsLiked(false)
        }
      }
    }

    checkLikeStatus()
  }, [id, user])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault() // Prevent any navigation
    
    if (!user) {
      setShowSignIn(true)
      return
    }

    if (!id) {
      toast.error('Invalid product')
      return
    }

    setIsLoading(true)
    try {
      const isLiked = await likedProductsService.toggleLike(id)
      setIsLiked(isLiked)
      onLikeChange?.(isLiked)
      toast.success(isLiked ? 'Added to wishlist!' : 'Removed from wishlist!')
    } catch (error: any) {
      console.error('Error toggling like:', error)
      if (error.message === 'Unauthorized') {
        setShowSignIn(true)
      } else {
        toast.error('Failed to update wishlist')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!id) {
      toast.error('Invalid product')
      return
    }

    try {
      await productsApi.trackClick(id)
      if (productURL) {
        window.open(productURL, '_blank')
      } else {
        router.push(`/product/${id}`)
      }
    } catch (error) {
      console.error('Error tracking click:', error)
      toast.error('Failed to open product')
    }
  }

  // Use a default image if the provided URL is invalid or uses example.com
  const imageUrlToUse = imageURL?.includes('example.com') 
    ? 'https://via.placeholder.com/400x400?text=Product+Image'
    : imageURL

  return (
    <>
      <SignInDialog 
        open={showSignIn} 
        onOpenChange={setShowSignIn} 
        onSuccess={async () => {
          // After successful sign in, check like status again
          if (user && id) {
            try {
              const isLiked = await likedProductsService.checkIfLiked(id)
              setIsLiked(isLiked)
              onLikeChange?.(isLiked)
            } catch (error) {
              console.error('Error checking like status:', error)
            }
          }
        }}
      />
      <div 
        className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative aspect-square">
          <img
            src={imageError ? '/images/placeholder.jpg' : imageURL}
            alt={name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
              imageError && "opacity-50"
            )}
            onError={handleImageError}
          />
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors duration-200",
                isLiked && "bg-red-50 hover:bg-red-100 text-red-500"
              )}
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                )} 
              />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              {brand?.name || "Brand Unavailable"}
            </div>
            <div className="line-clamp-2 flex-1 text-sm font-medium leading-tight">
              {name}
            </div>
            <div className="flex items-center gap-2">
              {discountedPrice ? (
                <>
                  <div className="text-sm line-through text-muted-foreground">
                    ${price.toFixed(2)}
                  </div>
                  <div className="text-sm font-semibold text-red-500">
                    ${discountedPrice.toFixed(2)}
                  </div>
                </>
              ) : (
                <div className="text-sm font-semibold">
                  ${price.toFixed(2)}
                </div>
              )}
            </div>
            {category && (
              <div className="text-xs text-muted-foreground">
                {category.name} {subCategory?.name ? `/ ${subCategory.name}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 
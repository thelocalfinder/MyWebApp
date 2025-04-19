export interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  images: string[]
  colors: string[]
  sizes: string[]
  category: string
  subcategory: string
  description: string
  isSale: boolean
  salePercentage?: number
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  slug: string
}

export interface Brand {
  id: string
  name: string
  logo?: string
  description?: string
}

export interface FilterState {
  priceRange: [number, number]
  selectedBrands: string[]
  selectedColors: string[]
  selectedSizes: string[]
  sortBy: string
} 
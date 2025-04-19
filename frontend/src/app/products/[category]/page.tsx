"use client"

import { useState, useEffect, useMemo } from "react"
import { Filter, ChevronDown, Tag, Palette, Ruler, AlertCircle, Package, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ProductCard } from "@/components/product-card"
import { FilterPanel } from "@/components/filter-panel"
import { productService } from "@/services/product-service"
import { Product } from "@/services/product-service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CategorySidebar } from "@/components/category-sidebar"
import { CategoryFilter } from "@/components/category-filter"
import { useRouter } from "next/navigation"

interface ProductFilters {
  subCategory?: string
  minPrice?: number
  maxPrice?: number
  brands?: string[]
  sortBy?: 'price_asc' | 'price_desc' | 'trending' | 'newest'
}

interface ActiveFilters {
  priceRange: [number, number]
  brands: string[]
  colors: string[]
  sizes: string[]
}

interface CategoryPageProps {
  params: {
    category: string
  },
  searchParams: {
    subcategory?: string
    brand?: string
    search?: string
  }
}

const sortOptions = [
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Trending Now", value: "trending" },
  { label: "Newest First", value: "newest" },
]

const categories = [
  { 
    label: "Women",
    value: "women",
    subcategories: [
      "Dresses",
      "Tops",
      "Pants",
      "Skirts",
      "Outerwear",
      "Activewear",
      "Swimwear"
    ]
  },
  { 
    label: "Men",
    value: "men",
    subcategories: [
      "Shirts",
      "Pants",
      "Suits",
      "Activewear",
      "Outerwear",
      "Swimwear"
    ]
  },
  { 
    label: "Kids",
    value: "kids",
    subcategories: [
      "Girls",
      "Boys",
      "Baby",
      "Shoes",
      "Accessories"
    ]
  },
  { 
    label: "Accessories",
    value: "accessories",
    subcategories: [
      "Bags",
      "Jewelry",
      "Shoes",
      "Belts",
      "Sunglasses",
      "Watches"
    ]
  },
  { 
    label: "Beauty",
    value: "beauty",
    subcategories: [
      "Skincare",
      "Makeup",
      "Fragrance",
      "Hair",
      "Bath & Body"
    ]
  },
]

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "trending" | "newest">("newest")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showSaleOnly, setShowSaleOnly] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    priceRange: [0, 1000],
    brands: [],
    colors: [],
    sizes: [],
  })
  const [activeFilterSection, setActiveFilterSection] = useState<'all' | 'price' | 'brand' | 'color' | 'size' | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000) count++
    count += activeFilters.brands.length
    count += activeFilters.colors.length
    count += activeFilters.sizes.length
    return count
  }, [activeFilters])

  const categoryName = params.category
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const subcategoryName = searchParams.subcategory
    ? decodeURIComponent(searchParams.subcategory)
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : undefined

  const getFilterCount = (type: keyof ActiveFilters) => {
    if (type === 'priceRange') {
      return activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000 ? 1 : 0
    }
    return activeFilters[type].length
  }

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value[0] > 0 || value[1] < 1000
  )

  const handleFiltersApply = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters)
    setIsFilterOpen(false)
  }

  const mapSortBy = (sort: typeof sortBy): "price_asc" | "price_desc" | "trending" | "newest" => {
    return sort;
  }

  const handleCategorySelect = (category: string, subcategory?: string) => {
    if (!category) {
      console.error('No category provided')
      return
    }
    
    try {
      const categoryPath = category.toLowerCase().replace(/\s+/g, '-')
      if (subcategory) {
        const subcategoryPath = subcategory.toLowerCase().replace(/\s+/g, '-')
        router.push(`/products/${categoryPath}?subcategory=${subcategoryPath}`)
      } else {
        router.push(`/products/${categoryPath}`)
      }
    } catch (error) {
      console.error('Error handling category selection:', error)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let response;
        
        // If there's a search query, use the search endpoint
        if (searchParams.search) {
          response = await productService.search(searchParams.search, {
            minPrice: activeFilters.priceRange[0],
            maxPrice: activeFilters.priceRange[1],
            brands: activeFilters.brands,
            sortBy: mapSortBy(sortBy)
          });
        }
        // If there's a brand parameter, filter by brand
        else if (searchParams.brand) {
          const brandName = searchParams.brand.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          response = await productService.getByBrand(brandName, {
            minPrice: activeFilters.priceRange[0],
            maxPrice: activeFilters.priceRange[1],
            sortBy: mapSortBy(sortBy)
          });
        }
        // Otherwise, use the category/subcategory logic
        else {
          const categoryPath = params.category.toLowerCase().replace(/-/g, ' ')
          const subcategoryPath = searchParams.subcategory?.toLowerCase().replace(/-/g, ' ')
          const searchPath = subcategoryPath || categoryPath
          
          response = await productService.getBySubCategory(
            searchPath,
            {
              minPrice: activeFilters.priceRange[0],
              maxPrice: activeFilters.priceRange[1],
              brands: activeFilters.brands,
              sortBy: mapSortBy(sortBy)
            }
          )
        }

        console.log('Products response:', response);
        if (!Array.isArray(response)) {
          throw new Error('Invalid response format from product service');
        }

        // Filter sale products if showSaleOnly is true
        const filteredProducts = showSaleOnly 
          ? response.filter(product => product.discountedPrice !== undefined && product.discountedPrice > 0)
          : response;

        console.log(`Found ${filteredProducts.length} products after sale filter`);
        setProducts(filteredProducts)
        
        // Get unique brands count
        const uniqueBrands = new Set(filteredProducts.map(p => p.brand?.name).filter(Boolean));
        setTotalBrands(uniqueBrands.size);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
        setProducts([])
        setTotalBrands(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [params.category, searchParams.subcategory, searchParams.brand, searchParams.search, activeFilters, sortBy, showSaleOnly])

  // Add debug logging for render
  console.log('Rendering CategoryPage with:', {
    categoryName,
    subcategoryName,
    productsCount: products.length,
    isLoading,
    error
  });

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{subcategoryName || categoryName}</h1>
          <p className="text-base text-[#666666] tracking-wide mb-8 font-light">
            {products.length} results from {totalBrands} brands
          </p>

          {/* Filter Buttons Container */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {/* Clothing Filter */}
            <CategoryFilter 
              onSelect={handleCategorySelect} 
              currentCategory={categoryName}
              currentSubcategory={subcategoryName}
              className="rounded-full px-6 whitespace-nowrap"
            />

            {/* Sort By Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap"
                >
                  Sort by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <Check className="h-4 w-4 text-gray-900" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sale Filter */}
            <Button
              variant="outline"
              className={cn(
                "rounded-full px-6 whitespace-nowrap",
                showSaleOnly && "border-[#8B6D3F] border-2 hover:border-[#8B6D3F]"
              )}
              onClick={() => setShowSaleOnly(!showSaleOnly)}
            >
              Sale
            </Button>

            {/* Brand Filter */}
            <Button
              variant="outline"
              className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap"
              onClick={() => {
                setActiveFilterSection('brand')
                setIsFilterOpen(true)
              }}
            >
              Brands
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Category Filter */}
            <Button
              variant="outline"
              className={cn(
                "rounded-full px-6 flex items-center gap-2 whitespace-nowrap",
                "border-[#8B6D3F] border-2"
              )}
            >
              Category
              <span className="bg-[#8B6D3F] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                1
              </span>
            </Button>

            {/* Size Filter */}
            <Button
              variant="outline"
              className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap"
              onClick={() => {
                setActiveFilterSection('size')
                setIsFilterOpen(true)
              }}
            >
              Size
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Price Filter */}
            <Button
              variant="outline"
              className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap"
              onClick={() => {
                setActiveFilterSection('price')
                setIsFilterOpen(true)
              }}
            >
              Price
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Color Filter */}
            <Button
              variant="outline"
              className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap"
              onClick={() => {
                setActiveFilterSection('color')
                setIsFilterOpen(true)
              }}
            >
              Color
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* All Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap"
                onClick={() => {
                  setActiveFilterSection('all')
                  setIsFilterOpen(true)
                }}
              >
                All Filters
                <span className="bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading products...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {/* Filter Panel */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <SheetTitle>
              {activeFilterSection === 'all' && 'All Filters'}
              {activeFilterSection === 'price' && 'Price Range'}
              {activeFilterSection === 'brand' && 'Brands'}
              {activeFilterSection === 'color' && 'Colors'}
              {activeFilterSection === 'size' && 'Sizes'}
            </SheetTitle>
            <FilterPanel
              initialFilters={activeFilters}
              onApply={handleFiltersApply}
              onClose={() => setIsFilterOpen(false)}
              activeSection={activeFilterSection || 'all'}
            />
          </SheetContent>
        </Sheet>

        {/* Category Sidebar */}
        <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle>Categories</DialogTitle>
            <CategorySidebar 
              onClose={() => setIsSidebarOpen(false)} 
              gender={params.category === 'men' ? 'men' : 'women'}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 
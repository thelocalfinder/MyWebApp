"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Check, ChevronDown, ChevronUp, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { brandsApi } from "@/lib/api-client"

const colors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Purple", value: "#800080" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Orange", value: "#FFA500" },
  { name: "Brown", value: "#A52A2A" },
  { name: "Gray", value: "#808080" },
  { name: "Navy", value: "#000080" },
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"] as const
type Size = typeof sizes[number]

interface Brand {
  id: number
  name: string
  websiteURL?: string
}

interface FilterPanelProps {
  initialFilters?: {
    priceRange: [number, number]
    brands: string[]
    colors: string[]
    sizes: string[]
  }
  onApply?: (filters: {
    priceRange: [number, number]
    brands: string[]
    colors: string[]
    sizes: string[]
  }) => void
  onClose?: () => void
  activeSection?: 'all' | 'price' | 'brand' | 'color' | 'size'
  maxPrice?: number
  totalProducts?: number
  totalBrands?: number
  onFilterChange?: (filters: {
    priceRange: [number, number]
    brands: string[]
    colors: string[]
    sizes: string[]
  }) => void
}

// Add new component for active filters
const ActiveFilter = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-900 hover:bg-gray-200">
    {label}
    <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
  </Badge>
)

export function FilterPanel({ 
  initialFilters, 
  onApply, 
  onClose, 
  activeSection = 'all',
  maxPrice = 2000,
  totalProducts = 0,
  totalBrands = 0,
  onFilterChange
}: FilterPanelProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters?.priceRange || [0, maxPrice])
  const [minPrice, setMinPrice] = useState(initialFilters?.priceRange[0].toString() || "0")
  const [maxPriceInput, setMaxPriceInput] = useState(initialFilters?.priceRange[1].toString() || maxPrice.toString())
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters?.brands || [])
  const [selectedColors, setSelectedColors] = useState<string[]>(initialFilters?.colors || [])
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialFilters?.sizes || [])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoadingBrands, setIsLoadingBrands] = useState(true)
  const [brandError, setBrandError] = useState<string | null>(null)
  const [priceUpdateTimeout, setPriceUpdateTimeout] = useState<NodeJS.Timeout | null>(null)

  const [openSections, setOpenSections] = useState({
    price: activeSection === 'all' || activeSection === 'price',
    brand: activeSection === 'all' || activeSection === 'brand',
    color: activeSection === 'all' || activeSection === 'color',
    size: activeSection === 'all' || activeSection === 'size',
  })

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log('Starting to fetch brands...')
        setIsLoadingBrands(true)
        setBrandError(null)
        const response = await brandsApi.getAll()
        console.log('Brands API response:', response)
        if (!Array.isArray(response)) {
          console.error('Invalid brands response format:', response)
          setBrandError('Invalid response format')
          return
        }
        if (response.length === 0) {
          console.warn('No brands returned from API')
        }
        setBrands(response)
      } catch (error) {
        console.error('Error fetching brands:', error)
        setBrandError(error instanceof Error ? error.message : 'Failed to load brands')
      } finally {
        setIsLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  useEffect(() => {
    if (initialFilters) {
      setPriceRange(initialFilters.priceRange)
      setMinPrice(initialFilters.priceRange[0].toString())
      setMaxPriceInput(initialFilters.priceRange[1].toString())
      setSelectedBrands(initialFilters.brands)
      setSelectedColors(initialFilters.colors)
      setSelectedSizes(initialFilters.sizes)
    }
  }, [initialFilters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++
    count += selectedBrands.length
    count += selectedColors.length
    count += selectedSizes.length
    return count
  }, [priceRange, selectedBrands, selectedColors, selectedSizes])

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleFilterChange = (filters: {
    priceRange: [number, number]
    brands: string[]
    colors: string[]
    sizes: string[]
  }) => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }

  const applyFilters = () => {
    const filters = {
      priceRange: [priceRange[0], priceRange[1]] as [number, number],
      brands: selectedBrands,
      colors: selectedColors,
      sizes: selectedSizes,
    }
    
    if (onApply) {
      onApply(filters)
    }
    if (onClose) {
      onClose()
    }
  }

  const clearFilters = () => {
    const newFilters = {
      priceRange: [0, maxPrice] as [number, number],
      brands: [] as string[],
      colors: [] as string[],
      sizes: [] as string[]
    }
    setPriceRange(newFilters.priceRange)
    setMinPrice("0")
    setMaxPriceInput(maxPrice.toString())
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedSizes([])
    handleFilterChange(newFilters)
    if (onApply) {
      onApply(newFilters)
    }
  }

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand) 
      ? selectedBrands.filter((b) => b !== brand) 
      : [...selectedBrands, brand]
    setSelectedBrands(newBrands)
    handleFilterChange({
      priceRange,
      brands: newBrands,
      colors: selectedColors,
      sizes: selectedSizes
    })
  }

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color]
    setSelectedColors(newColors)
    handleFilterChange({
      priceRange,
      brands: selectedBrands,
      colors: newColors,
      sizes: selectedSizes
    })
  }

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size]
    setSelectedSizes(newSizes)
    handleFilterChange({
      priceRange,
      brands: selectedBrands,
      colors: selectedColors,
      sizes: newSizes
    })
  }

  const handlePriceRangeChange = (value: number[]) => {
    const newPriceRange = [value[0], value[1]] as [number, number]
    setPriceRange(newPriceRange)
    setMinPrice(value[0].toString())
    setMaxPriceInput(value[1].toString())

    // Clear existing timeout
    if (priceUpdateTimeout) {
      clearTimeout(priceUpdateTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      handleFilterChange({
        priceRange: newPriceRange,
        brands: selectedBrands,
        colors: selectedColors,
        sizes: selectedSizes
      })
      if (onApply) {
        onApply({
          priceRange: newPriceRange,
          brands: selectedBrands,
          colors: selectedColors,
          sizes: selectedSizes
        })
      }
    }, 500) // 500ms delay

    setPriceUpdateTimeout(timeout)
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMinPrice(value)
    if (value && !isNaN(Number(value))) {
      const newPriceRange = [Number(value), priceRange[1]] as [number, number]
      setPriceRange(newPriceRange)
      handleFilterChange({
        priceRange: newPriceRange,
        brands: selectedBrands,
        colors: selectedColors,
        sizes: selectedSizes
      })
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMaxPriceInput(value)
    if (value && !isNaN(Number(value))) {
      const newPriceRange = [priceRange[0], Number(value)] as [number, number]
      setPriceRange(newPriceRange)
      handleFilterChange({
        priceRange: newPriceRange,
        brands: selectedBrands,
        colors: selectedColors,
        sizes: selectedSizes
      })
    }
  }

  // Add active filters section
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = []
    
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      filters.push({
        label: `$${priceRange[0]} - $${priceRange[1]}`,
        onRemove: () => {
          setPriceRange([0, maxPrice])
          setMinPrice("0")
          setMaxPriceInput(maxPrice.toString())
          handleFilterChange({
            priceRange: [0, maxPrice],
            brands: selectedBrands,
            colors: selectedColors,
            sizes: selectedSizes
          })
        }
      })
    }

    selectedBrands.forEach(brand => {
      filters.push({
        label: brand,
        onRemove: () => toggleBrand(brand)
      })
    })

    selectedColors.forEach(color => {
      filters.push({
        label: color,
        onRemove: () => toggleColor(color)
      })
    })

    selectedSizes.forEach(size => {
      filters.push({
        label: size,
        onRemove: () => toggleSize(size)
      })
    })

    return filters
  }, [priceRange, selectedBrands, selectedColors, selectedSizes])

  return (
    <div className="h-full overflow-y-auto">
      <div className="py-4 px-4">
        <DialogTitle className="mb-4 text-base md:text-lg font-semibold flex items-center justify-between">
          <div>
            {activeSection === 'all' ? 'All Filters' : 
             activeSection === 'price' ? 'Price Range' :
             activeSection === 'brand' ? 'Brands' :
             activeSection === 'color' ? 'Colors' :
             'Sizes'}
            {activeFilterCount > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                ({activeFilterCount} active)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={applyFilters}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Apply
                </Button>
              </>
            )}
          </div>
        </DialogTitle>

        <div className="space-y-4">
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Active Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <ActiveFilter
                    key={`${filter.label}-${index}`}
                    label={filter.label}
                    onRemove={filter.onRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Brand Filter */}
          {(activeSection === 'all' || activeSection === 'brand') && (
            <Collapsible open={openSections.brand} onOpenChange={() => toggleSection("brand")}>
              {activeSection === 'all' && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Brands</span>
                      {selectedBrands.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full">
                          {selectedBrands.length}
                        </span>
                      )}
                    </div>
                    {openSections.brand ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent className="pt-2">
                {isLoadingBrands ? (
                  <div className="text-sm text-muted-foreground">Loading brands...</div>
                ) : brandError ? (
                  <div className="text-sm text-red-600">{brandError}</div>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-md cursor-pointer hover:bg-gray-50",
                          selectedBrands.includes(brand.name) && "bg-gray-100"
                        )}
                        onClick={() => toggleBrand(brand.name)}
                      >
                        <div className="relative w-4 h-4 border rounded">
                          {selectedBrands.includes(brand.name) && (
                            <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-gray-900" />
                          )}
                        </div>
                        <span className="text-sm">{brand.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Color Filter */}
          {(activeSection === 'all' || activeSection === 'color') && (
            <Collapsible open={openSections.color} onOpenChange={() => toggleSection("color")}>
              {activeSection === 'all' && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Colors</span>
                      {selectedColors.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full">
                          {selectedColors.length}
                        </span>
                      )}
                    </div>
                    {openSections.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {colors.map((color) => (
                    <div
                      key={color.name}
                      className={cn(
                        "relative aspect-square rounded-md cursor-pointer border",
                        selectedColors.includes(color.name) && "ring-2 ring-gray-900"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => toggleColor(color.name)}
                    >
                      {selectedColors.includes(color.name) && (
                        <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white drop-shadow" />
                      )}
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                        {color.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Size Filter */}
          {(activeSection === 'all' || activeSection === 'size') && (
            <Collapsible open={openSections.size} onOpenChange={() => toggleSection("size")}>
              {activeSection === 'all' && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sizes</span>
                      {selectedSizes.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full">
                          {selectedSizes.length}
                        </span>
                      )}
                    </div>
                    {openSections.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent className="pt-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "default" : "outline"}
                      className={cn(
                        "w-full h-12 text-base",
                        selectedSizes.includes(size) 
                          ? "bg-gray-900 hover:bg-gray-800 text-white" 
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Price Range Filter */}
          {(activeSection === 'all' || activeSection === 'price') && (
            <Collapsible open={openSections.price} onOpenChange={() => toggleSection("price")}>
              {activeSection === 'all' && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Price</span>
                      {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                        <span className="text-xs bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent className="pt-2">
                <div className="space-y-4">
                  <Slider
                    defaultValue={priceRange}
                    value={priceRange}
                    min={0}
                    max={maxPrice}
                    step={100}
                    onValueChange={handlePriceRangeChange}
                    className="py-6"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="minPrice">Min Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                        <Input 
                          id="minPrice" 
                          value={minPrice} 
                          onChange={handleMinPriceChange} 
                          className="pl-7 h-12" 
                          type="number"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="maxPrice">Max Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                        <Input 
                          id="maxPrice" 
                          value={maxPriceInput} 
                          onChange={handleMaxPriceChange} 
                          className="pl-7 h-12" 
                          type="number"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  )
}
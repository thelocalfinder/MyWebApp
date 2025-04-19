"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { categoriesApi } from "@/lib/api-client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SubCategory {
  id: number
  name: string
  categoryId: number
}

interface Category {
  id: number
  name: string
  gender?: string | null
  subcategories?: SubCategory[]
}

interface CategorySidebarProps {
  onClose?: () => void
  gender: string
}

export function CategorySidebar({ onClose, gender: initialGender }: CategorySidebarProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [gender, setGender] = useState<string | undefined>(initialGender)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        console.log('Fetching categories for gender:', gender)
        const data = await categoriesApi.getAll(gender)
        console.log('Received categories data:', data)
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [gender]) // Re-fetch when gender changes

  const handleGenderSelect = (selected: string) => {
    setGender(selected)
    setSelectedCategory(null)
  }

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
  }

  const handleSubcategorySelect = (categoryName: string, subcategory?: SubCategory) => {
    const path = subcategory 
      ? `${categoryName.toLowerCase()}?subcategory=${subcategory.name.toLowerCase()}`
      : categoryName.toLowerCase()
    
    router.push(`/products/${path.replace(/\s+/g, '-')}`)
    if (onClose) {
      onClose()
    }
  }

  if (loading) {
    return <div className="p-4">Loading categories...</div>
  }

  if (!categories.length) {
    return <div className="p-4">No categories found</div>
  }

  return (
    <div className="fixed inset-0 bg-white md:relative md:h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Shop</h2>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close menu</span>
        </Button>
      </div>

      <div className="p-4">
        <div className="flex gap-2">
          <Button
            variant={gender === "men" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleGenderSelect("men")}
          >
            Men
          </Button>
          <Button
            variant={gender === "women" ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleGenderSelect("women")}
          >
            Women
          </Button>
        </div>
      </div>

      {gender && (
        <>
          <Separator />
          <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-200px)]">
            <div className="flex flex-col p-4">
              <h3 className="mb-2 font-medium">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div key={category.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between",
                        selectedCategory === category.id && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      {category.name}
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          selectedCategory === category.id && "rotate-90"
                        )}
                      />
                    </Button>
                    {selectedCategory === category.id && (
                      <div className="ml-4 space-y-1">
                        <button
                          className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleSubcategorySelect(category.name)}
                        >
                          All {category.name}
                        </button>
                        {category.subcategories && category.subcategories.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {category.subcategories.map((subcat) => (
                              <button
                                key={`${category.id}-${subcat.id}`}
                                className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleSubcategorySelect(category.name, subcat)}
                              >
                                {subcat.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No subcategories available</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
} 
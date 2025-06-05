import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { categories } from "@/data/categories"
import { cn } from "@/lib/utils"

interface SubCategory {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
  gender?: string | null
  subcategories: SubCategory[]
}

interface CategoryFilterProps {
  onSelect: (category: string, subcategory?: string) => void
  currentCategory?: string
  currentSubcategory?: string
  className?: string
}

export function CategoryFilter({ onSelect, currentCategory, currentSubcategory, className }: CategoryFilterProps) {
  const [selectedGender, setSelectedGender] = useState<'women' | 'men'>('women')

  const filteredCategories = categories.filter(cat => 
    !cat.gender || 
    cat.gender.trim() === '' || 
    cat.gender.toLowerCase() === selectedGender.toLowerCase()
  )

  const buttonText = currentSubcategory || currentCategory || "Category"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("flex items-center gap-2", className)}>
          {buttonText}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <div className="flex gap-2 p-2 border-b">
          <Button
            variant={selectedGender === "women" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setSelectedGender("women")}
          >
            Women
          </Button>
          <Button
            variant={selectedGender === "men" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setSelectedGender("men")}
          >
            Men
          </Button>
        </div>
        <div className="py-2">
          {filteredCategories.length === 0 ? (
            <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
          ) : (
            filteredCategories.map((category) => (
              <DropdownMenuSub key={`category-${category.id}`}>
                <DropdownMenuSubTrigger className="flex items-center justify-between">
                  {category.name}
                  <ChevronRight className="h-4 w-4" />
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem 
                    key={`all-${category.id}`}
                    onClick={() => onSelect(category.name)}
                  >
                    All {category.name}
                  </DropdownMenuItem>
                  {category.subcategories?.map((subcategory) => (
                    <DropdownMenuItem
                      key={`subcategory-${subcategory.id}-${category.id}`}
                      onClick={() => onSelect(category.name, subcategory.name)}
                    >
                      {subcategory.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
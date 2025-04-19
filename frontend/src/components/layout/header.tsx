"use client"

import { useState, useEffect } from "react"
import { Menu, Search, Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { CategorySidebar } from "@/components/category-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { SignInDialog } from "@/components/sign-in-dialog"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { categoriesApi, brandsApi } from "@/lib/api-client"

interface SearchResult {
  type: 'category' | 'brand' | 'subcategory'
  name: string
  path: string
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsLoading(true)
        try {
          // Fetch categories and brands from the API
          const [categories, brands] = await Promise.all([
            categoriesApi.getAll(),
            brandsApi.getAll()
          ])

          const results: SearchResult[] = []
          const addedPaths = new Set<string>() // Track unique paths

          // Process categories and their subcategories
          categories.forEach(category => {
            const categoryLower = category.name.toLowerCase()
            const queryLower = searchQuery.toLowerCase()
            
            // Add main category if it matches and hasn't been added
            if (categoryLower.includes(queryLower)) {
              const path = `/products/${categoryLower.replace(/\s+/g, '-')}`
              if (!addedPaths.has(path)) {
                results.push({
                  type: 'category',
                  name: category.name,
                  path
                })
                addedPaths.add(path)
              }
            }

            // Add subcategories if they match
            if (category.subcategories) {
              category.subcategories.forEach(sub => {
                const subLower = sub.name.toLowerCase()
                if (subLower.includes(queryLower) || categoryLower.includes(queryLower)) {
                  const path = `/products/${categoryLower.replace(/\s+/g, '-')}?subcategory=${subLower.replace(/\s+/g, '-')}`
                  if (!addedPaths.has(path)) {
                    results.push({
                      type: 'subcategory',
                      name: sub.name,
                      path
                    })
                    addedPaths.add(path)
                  }
                }
              })
            }
          })

          // Process brands
          brands.forEach(brand => {
            const brandLower = brand.name.toLowerCase()
            if (brandLower.includes(searchQuery.toLowerCase())) {
              const path = `/products?brand=${brandLower.replace(/\s+/g, '-')}`
              if (!addedPaths.has(path)) {
                results.push({
                  type: 'brand',
                  name: brand.name,
                  path
                })
                addedPaths.add(path)
              }
            }
          })

          // Sort results by type and then alphabetically
          const sortOrder = { category: 1, subcategory: 2, brand: 3 }
          const sortedResults = results.sort((a, b) => {
            if (sortOrder[a.type] !== sortOrder[b.type]) {
              return sortOrder[a.type] - sortOrder[b.type]
            }
            return a.name.localeCompare(b.name)
          })

          setSearchResults(sortedResults)
        } catch (error) {
          console.error('Error searching:', error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300) // Debounce search for 300ms

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleHeartClick = () => {
    if (!isAuthenticated) {
      setShowSignIn(true)
      return
    }
    router.push("/liked")
  }

  const handleSearchItemClick = (result: SearchResult) => {
    setIsSearchOpen(false)
    setSearchQuery("")
    router.push(result.path)
  }

  // Update the search result display
  const renderSearchResult = (result: SearchResult) => (
    <button
      key={`${result.type}-${result.name}`}
      onClick={() => handleSearchItemClick(result)}
      className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
    >
      {result.name}
    </button>
  )

  // Update the search results display in both desktop and mobile sections
  const searchResultsList = (
    <div className="space-y-2">
      {searchResults.map(renderSearchResult)}
    </div>
  )

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          isScrolled ? "h-14" : "h-16"
        )}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetTitle className="p-4 text-xl font-bold">Shop</SheetTitle>
                <CategorySidebar onClose={() => setIsMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className={cn(
                  "font-extrabold text-2xl sm:text-3xl tracking-tight transition-transform font-sans",
                  isScrolled ? "scale-90" : "scale-100"
                )}>
                  <span className="text-primary">the</span>
                  <span className="text-gray-900">local</span>
                  <span className="text-primary">finder</span>
                </span>
              </button>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden flex-1 items-center justify-center px-4 md:flex">
            <div className="relative w-full max-w-md">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search categories and brands"
                className="w-full rounded-full border bg-transparent px-4 py-1.5 text-sm focus:outline-none focus:ring-1"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              {isSearchOpen && (searchResults.length > 0 || isLoading) && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border bg-background p-2 shadow-lg">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  ) : searchResultsList}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleHeartClick}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery("")
                setSearchResults([])
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search categories and brands"
              className="flex-1 bg-transparent text-sm focus:outline-none"
              autoFocus
            />
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            ) : searchResults.length > 0 ? (
              searchResultsList
            ) : searchQuery ? (
              <p className="text-center text-sm text-muted-foreground">No matching categories or brands found</p>
            ) : null}
          </div>
        </div>
      )}

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </>
  )
} 
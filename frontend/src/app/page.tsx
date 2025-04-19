import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/product-service"
import { Product } from "@/services/product-service"
import { brandsApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

// Hero banner data
const heroBanner = {
  image: "/images/banners/featured-collection.jpg",
  title: "Featured Collection",
  description: "Gen Attire is a brand that seamlessly combines comfort and sophistication. Our designs are thoughtfully crafted to empower Gen Z to feel confident and at ease. With us, you'll always look effortlessly stylish and exude confidence wherever you go.",
  link: "/products/featured"
}

// Featured sections data
const featuredSections = [
  {
    id: 1,
    title: "100 UNDER 300",
    description: "Stylish items that won't break the bank.",
    image: "/images/featured/budget-main.jpg" as string,
    link: "/budget-friendly"
  },
  {
    id: 2,
    title: "16 BRANDS CHANGING THE SWIMWEAR GAME",
    description: "From distinctive silhouettes to innovative fabrications.",
    image: "/images/featured/swimwear.jpg" as string,
    link: "/swimwear-brands"
  },
  {
    id: 3,
    title: "THE ART OF CONTROLLED ATTENTION",
    description: "You're not Little Red Riding Hood. You're the wolf.",
    image: "/images/featured/attention.jpg" as string,
    link: "/statement-pieces"
  }
] as const;

export default async function Home() {
  // Fetch editor's pick and trending products
  let editorsPick: Product[] = [];
  let trending: Product[] = [];

  try {
    [editorsPick, trending] = await Promise.all([
      productService.getEditorsPick(5),
      productService.getTrending({ limit: 5 })
    ]);
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="space-y-16 bg-[#f5f3f0] pb-16">
      {/* Hero Banner */}
      <section className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:min-h-screen">
          {/* Image Container */}
          <div className="relative h-[80vh] md:h-screen md:w-[75%] w-full">
            <Image
              src={heroBanner.image}
              alt={heroBanner.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          </div>

          {/* Content Container */}
          <div className="flex flex-col px-4 py-6 md:absolute md:inset-y-0 md:right-0 md:w-[25%] md:py-0">
            <div className="md:max-w-[280px] md:mx-auto space-y-6 md:pt-[15vh]">
              <h2 className="text-3xl md:text-[42px] font-normal font-serif leading-[1.1]">{heroBanner.title}</h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
                {heroBanner.description}
              </p>
              <Link href={heroBanner.link}>
                <Button 
                  className="mt-4 w-full md:w-auto bg-black text-white hover:bg-black/90 text-sm rounded-sm px-8 h-12" 
                  size="default"
                >
                  Explore now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections Grid */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
          {featuredSections.map((section) => (
            <div key={section.id} className="w-[85vw] md:w-auto flex-shrink-0 snap-center space-y-4">
              <div className="aspect-[3/4] relative">
                <Image
                  src={section.image}
                  alt={section.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-lg font-mono tracking-tight">{section.title}</h2>
              <p className="text-sm text-gray-600">{section.description}</p>
              <Link href={section.link}>
                <Button variant="outline" className="rounded-none border-black hover:bg-transparent">
                  Shop now
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Editor's Pick */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif">Editor's Picks</h2>
            <p className="text-sm text-muted-foreground">Your shortcut to what's trending now.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-200"
                aria-label="Previous"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-200"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/editors-pick">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-4 border-gray-200 hover:bg-transparent"
              >
                See all
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {editorsPick.length > 0 ? (
              editorsPick.map((product) => (
                <div key={product.id} className="w-[280px] flex-none snap-start">
                  <ProductCard
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
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-gray-500">No editor's picks available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif">Trending Now</h2>
            <p className="text-sm text-muted-foreground">What's popular right now.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-200"
                aria-label="Previous"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-200"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/products/trending">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-4 border-gray-200 hover:bg-transparent"
              >
                See all
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {trending.length > 0 ? (
              trending.map((product) => (
                <div key={product.id} className="w-[280px] flex-none snap-start">
                  <ProductCard
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
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-gray-500">No trending products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Media Footer */}
      <footer className="border-t py-6 sm:py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="https://www.instagram.com/thelocalfinder/" className="text-gray-600 hover:text-black">
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Follow us on social media</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
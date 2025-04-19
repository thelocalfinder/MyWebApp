import Image from "next/image"
import { productService } from "@/services/product-service"
import { Product } from "@/services/product-service"
import { ProductCard } from "@/components/product-card"

// This would ideally come from a CMS or backend API
const featuredCollection = {
  image: "/images/banners/featured-collection.jpg",
  title: "Featured Collection",
  description: "Gen Attire is a brand that seamlessly combines comfort and sophistication. Our designs are thoughtfully crafted to empower Gen Z to feel confident and at ease. With us, you'll always look effortlessly stylish and exude confidence wherever you go.",
  brandName: "Gen Attire" // This should match the brand name in your database
}

export default async function FeaturedCollectionPage() {
  // Get products from the featured brand
  const products = await productService.getByBrand(featuredCollection.brandName)

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:min-h-screen">
        {/* Image Container */}
        <div className="relative h-[80vh] md:h-screen md:w-[75%] w-full">
          <Image
            src={featuredCollection.image}
            alt={featuredCollection.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>

        {/* Content Container */}
        <div className="flex flex-col px-4 py-6 md:absolute md:inset-y-0 md:right-0 md:w-[25%] md:py-0">
          <div className="md:max-w-[280px] md:mx-auto space-y-6 md:pt-[15vh]">
            <h1 className="text-3xl md:text-[42px] font-normal font-serif leading-[1.1]">{featuredCollection.title}</h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
              {featuredCollection.description}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product: Product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>

        {/* No Products State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available in this collection at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
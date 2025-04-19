"use client"

import Image from "next/image"
import { ProductCard } from "@/components/product-card"
import { productService } from "@/services/product-service"
import { Product } from "@/services/product-service"

export default async function EditorsPickPage() {
  let products: Product[] = [];

  try {
    products = await productService.getEditorsPick(20); // Get more products for the dedicated page
  } catch (error) {
    console.error('Error fetching editor\'s pick products:', error);
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-[40vh] w-full">
          <Image
            src="/placeholder.svg"
            alt="Editor's Pick"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
            <h1 className="text-4xl font-semibold mb-4">Editor's Pick</h1>
            <p className="text-lg max-w-2xl">
              Discover our carefully curated selection of the season's most coveted pieces. 
              From statement accessories to must-have wardrobe essentials, these are the items 
              our fashion editors can't stop talking about.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                discountedPrice={product.discountedPrice}
                image={product.imageURL}
                brand={product.brand?.name || 'Unknown Brand'}
                category={product.category?.name || 'Unknown Category'}
                subCategory={product.subCategory?.name}
                isEditorsPick={product.isEditorsPick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No editor's picks available at the moment.</p>
            <p className="mt-2 text-gray-400">Please check back later for our latest curated selection.</p>
          </div>
        )}
      </section>
    </div>
  )
} 
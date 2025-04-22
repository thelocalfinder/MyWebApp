interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageURL: string;
  brand: { name: string };
  category: { name: string };
  subCategory?: { name: string };
  isEditorsPick?: boolean;
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
}: ProductCardProps) {
  // ... existing code ...
} 
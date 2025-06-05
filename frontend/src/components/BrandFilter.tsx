import { brands } from '../data/brands';
import { useState } from 'react';

const BrandFilter = () => {
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggleBrand = (brandId: number) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const displayedBrands = showAll ? brands : brands.slice(0, 5);

  return (
    <div className="brand-filter bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Brands</h2>
      <div className="space-y-2">
        {displayedBrands.map(brand => (
          <label key={brand.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand.id)}
              onChange={() => toggleBrand(brand.id)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{brand.name}</span>
          </label>
        ))}
        {brands.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BrandFilter; 
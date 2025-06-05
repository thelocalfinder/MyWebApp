import { categories } from '../data/categories';
import { useState } from 'react';

const Sidebar = () => {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  return (
    <div className="sidebar bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="border-b border-gray-200 pb-2">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded-md flex justify-between items-center"
            >
              <span className="font-medium">{category.name}</span>
              <span>{expandedCategory === category.id ? '−' : '+'}</span>
            </button>
            {expandedCategory === category.id && (
              <div className="pl-4 mt-2 space-y-1">
                {category.subcategories.map(subcategory => (
                  <a
                    key={subcategory.id}
                    href={`/products?category=${category.id}&subcategory=${subcategory.id}`}
                    className="block py-1 px-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    {subcategory.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 
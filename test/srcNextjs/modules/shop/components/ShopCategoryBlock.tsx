import React from 'react';
import Image from 'next/image';

const ShopCategoryBlock = ({ categories }: { categories: any[] }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">Danh mục nổi bật</h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((cat) => (
          <div key={cat.id} className="group cursor-pointer flex flex-col items-center">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-gray-100 mb-2 group-hover:border-brand-orange transition-all">
               {cat.image ? (
                 <Image src={cat.image} alt={cat.name} fill className="object-cover"/>
               ) : (
                 <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                   No Img
                 </div>
               )}
            </div>
            <p className="text-center text-sm font-medium text-gray-700 group-hover:text-brand-orange line-clamp-2">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopCategoryBlock; 
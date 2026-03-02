// src/modules/product-detail/components/PromoCombo.tsx
import React from "react";
import ArrowRightIcon from "@/icons/arrow-right.svg";

interface ComboProduct {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
}

interface PromoComboProps {
  products: ComboProduct[];
}

const PromoCombo: React.FC<PromoComboProps> = ({ products }) => (
  <div className="mt-4">
    <h3 className="text-lg font-semibold text-brand-orange mb-3">
      Combo khuyến mãi
    </h3>
    <div className="flex flex-col gap-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-md"
          />
          <div className="flex-1">
            <p className="text-sm text-black line-clamp-2">
              {product.title}
            </p>
            <span className="text-base font-medium text-brand-orange-dark">
              {product.price}
            </span>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export default PromoCombo;
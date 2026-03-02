import React from "react";
import Link from "next/link";

interface ProductCardRowProps {
  product: any; // Bạn có thể thay 'any' bằng interface Product chuẩn của dự án
}

const ProductCardRow: React.FC<ProductCardRowProps> = ({ product }) => {
  if (!product) return null;

  // Xử lý logic hiển thị giá (loại bỏ chữ VND nếu cần để style riêng, hoặc giữ nguyên)
  const priceDisplay = product.price || "Liên hệ";
  
  return (
    <Link 
      href={`/product-details/${product.id}`} 
      className="group flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer"
    >
      {/* 1. Ảnh sản phẩm (Bên trái) */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-100 bg-white">
        <img
          src={product.image || "/assets/placeholder.png"}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badge giảm giá (nếu có) */}
        {product.discount && (
          <span className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md shadow-sm z-10">
            {product.discount}
          </span>
        )}
      </div>

      {/* 2. Thông tin (Bên phải) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Tên sản phẩm (giới hạn 2 dòng) */}
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 group-hover:text-brand-orange transition-colors" title={product.title}>
          {product.title}
        </h4>
        
        {/* Giá và Đã bán */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-red-600">
              {priceDisplay}
            </span>
            {/* Nếu có giá gốc (giả lập logic hiển thị giá gốc nếu cần) */}
             {/* <span className="text-xs text-gray-400 line-through">350.000đ</span> */}
          </div>

          {product.sold && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                Đã bán {product.sold}
              </span>
              {product.tag && (
                 <span className="text-[10px] text-brand-orange border border-orange-200 px-1 py-0 rounded-[2px] uppercase">
                   {product.tag}
                 </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Icon mũi tên (Tùy chọn - hiện khi hover) */}
      <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
};

export default ProductCardRow;
// src/modules/product/components/ProductAboutSection.tsx
"use client";

import React, { useState } from "react";

const ProductAboutSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl w-full p-8 md:p-16 mt-12 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Cột Ảnh */}
        <img
          src="/assets-product/ImageAsset1.png"
          alt="LoveGifts Promotion"
          className="w-full h-auto max-h-[430px] object-cover rounded-2xl"
        />

        {/* Cột Text */}
        <div className="flex flex-col items-start gap-6">
          <h2 className="font-sans text-4xl font-bold text-brand-dark-green tracking-wide">
            lovegifts
          </h2>
          
          {/* Thêm overflow-hidden và transition-all */}
          <div
            className={`font-sans text-lg text-black font-light leading-relaxed overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[1000px]" : "max-h-48"
            }`}
          >
            Đồ chơi không chỉ là món quà giúp bé vui chơi mỗi ngày mà còn là người
            bạn đồng hành trong hành trình phát triển trí tuệ và cảm xúc. Với chất
            liệu an toàn, màu sắc sinh động và thiết kế thông minh, sản phẩm đồ
            chơi tại LoveGift mang đến cho bé những giờ phút giải trí bổ ích, kích
            thích khả năng sáng tạo và tư duy logic. Mỗi món đồ chơi đều được chọn
            lọc kỹ lưỡng từ nhựa cao cấp, gỗ...
            {/* Nội dung thêm (nếu có) */}
            {isExpanded && (
              <p className="mt-4">
                ...Thêm nội dung chi tiết ở đây khi người dùng nhấn "xem thêm".
              </p>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white rounded-full h-auto shadow-card min-w-[214px] flex flex-row justify-center items-center gap-2.5 px-8 py-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="font-sans text-base text-black">
              {isExpanded ? "Thu gọn" : "Xem thêm"}
            </div>
            {/* Nếu bạn có SVG cho icon này thì thay vào đây, tạm thời dùng img như cũ */}
            <img
              width="18.5px"
              height="30.1px"
              src="/assets-product/SvgAsset1.svg"
              alt={isExpanded ? "Thu gọn" : "Xem thêm"}
              className={`transform transition-transform duration-300 ${
                isExpanded ? "rotate-0" : "rotate-180" // Lật icon
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAboutSection;
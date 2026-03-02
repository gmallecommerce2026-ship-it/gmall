// src/modules/product-detail/components/ProductDescription.tsx
"use client";
import React, { useState } from "react";

interface ProductDescriptionProps {
  productTitle: string; 
}
const ProductDescription: React.FC<ProductDescriptionProps> = ({productTitle}) => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-4 px-6 text-lg font-medium transition-colors ${
            activeTab === "details"
              ? "text-brand-orange border-b-2 border-brand-orange"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Chi tiết sản phẩm
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`py-4 px-6 text-lg font-medium transition-colors ${
            activeTab === "reviews"
              ? "text-brand-orange border-b-2 border-brand-orange"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Đánh giá sản phẩm
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "details" && (
          // Sử dụng class 'prose' của Tailwind Typography để tự động format text
          <div className="prose prose-sm max-w-none text-black prose-h3:font-semibold prose-h4:font-semibold">
            <h3>MÔ TẢ SẢN PHẨM</h3>
            <p>
              Giày tennis GEL-RESOLUTION™ X mang đến độ ổn định và êm ái tối ưu
              cho người chơi thích kiểm soát trận đấu từ cuối sân.
            </p>

            <h4>Công nghệ DYNALACING™</h4>
            <p>
              Công nghệ DYNALACING™ được thiết kế đặc biệt để tăng cường độ bám
              khi cần hỗ trợ thêm, giúp bạn cảm thấy chắc chắn khi thực hiện các
              pha di chuyển nhanh. Đế giữa hai lớp cũng giúp cải thiện độ ổn định
              khi chân tiếp đất trên sân.
            </p>

            <h4>Công nghệ DYNAWALL™</h4>
            <p>
              Công nghệ DYNAWALL™ trong đế giữa kéo dài đến gót chân, tăng thêm
              độ ổn định khi di chuyển ngang. Đây là tính năng hiệu quả, đặc
              biệt hữu ích khi bạn di chuyển để bao quát hai bên cuối sân.
            </p>

            <p>
              Cuối cùng, cổ giày cao hơn ở mặt trong giúp ngăn ngừa tình trạng
              lật cổ chân khi bạn thực hiện các động tác đổi hướng đột ngột qua
              lại.
            </p>

            <ul>
              <li>Xuất xứ: Vietnam</li>
              <li>Thành phần: 88% SYN LEATHER 12% SYN FIBER</li>
              <li>Hướng dẫn sử dụng: giặt tay & phơi tránh nắng gắt</li>
              <li>
                Thông tin cảnh báo: Không dùng bàn chải cứng, không dùng hóa
                chất tẩy rửa
              </li>
            </ul>

            <h3 className="mt-6">MÔ TẢ CHI TIẾT :</h3>
            <h4>Công nghệ PGUARD™</h4>
            <p>Giúp cải tiến độ bền trong khu vực bên trong mũi giày</p>
            <h4>Công nghệ DYNAWALL™</h4>
            <p>Giúp cải tiến độ ổn định</p>
            {/* ... Thêm các chi tiết còn lại ... */}
            <p>
              Tấm lót giày được sản xuất bằng quy trình nhuộm bằng dung dịch
              giúp giảm lượng nước sử dụng khoảng 33% và lượng khí thải carbon
              khoảng 45% so với công nghệ nhuộm thông thường.
            </p>
          </div>
        )}
        {activeTab === "reviews" && (
          <div>
            <p className="text-gray-600">
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
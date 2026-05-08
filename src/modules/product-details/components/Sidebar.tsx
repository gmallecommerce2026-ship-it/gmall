import React from "react";
import ProductCard from "@/modules/product/components/ProductCard";
import SidebarVoucherCard from "./SidebarVoucherCard";
import { Product } from "@/types/product";

interface SidebarProps {
  vouchers: any[]; 
  featuredProduct: Product | null;
}

const Sidebar: React.FC<SidebarProps> = ({ vouchers, featuredProduct }) => {
  // Chỉ lấy tối đa 3 voucher để hiển thị cho gọn
  const displayVouchers = vouchers && Array.isArray(vouchers) ? vouchers.slice(0, 3) : [];

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. KHỐI VOUCHER SHOP */}
      {displayVouchers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-brand-orange">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              Mã giảm giá của Shop
            </h3>
          </div>
          
          <div className="p-4 flex flex-col gap-3">
            {displayVouchers.map((voucher, idx) => (
              <SidebarVoucherCard key={voucher.id || idx} voucher={voucher} />
            ))}
          </div>
        </div>
      )}

      {/* 2. KHỐI SẢN PHẨM NỔI BẬT */}
      {featuredProduct && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
             <h3 className="text-base font-bold text-gray-900">
               Sản phẩm nổi bật
             </h3>
          </div>
          <div className="p-4">
             {/* Truyền product vào ProductCard */}
             <ProductCard product={featuredProduct} />
          </div>
        </div>
      )}

      {/* 3. KHỐI CAM KẾT — fix #5: tránh sidebar trống bên phải khi không có
          voucher và không có sản phẩm nổi bật. Cam kết là static, không phụ
          thuộc data → luôn render được, đỡ chiếm whitespace.  */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-bold text-gray-900">Cam kết của GMall</h3>
        </div>
        <ul className="p-4 text-sm text-gray-700 space-y-2.5">
          {[
            { icon: "🛡️", title: "Bảo hành chính hãng", desc: "Hỗ trợ đổi trả 7 ngày" },
            { icon: "🚚", title: "Miễn phí vận chuyển", desc: "Cho đơn từ 199.000đ" },
            { icon: "💎", title: "Sản phẩm chất lượng", desc: "Đã qua kiểm duyệt" },
            { icon: "💬", title: "Hỗ trợ 24/7", desc: "Chat trực tiếp với shop" },
          ].map((c) => (
            <li key={c.title} className="flex gap-3">
              <span aria-hidden className="text-lg leading-none mt-0.5">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 leading-tight">{c.title}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{c.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
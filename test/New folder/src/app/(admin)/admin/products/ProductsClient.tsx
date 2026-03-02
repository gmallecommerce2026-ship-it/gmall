// src/app/(admin)/admin/products/page.tsx
'use client';

import React from 'react';
import { FiSearch, FiFilter, FiMoreHorizontal, FiEye, FiTrash2, FiSlash } from 'react-icons/fi';

const MOCK_PRODUCTS = [
  { id: 101, name: 'Hộp Quà Sinh Nhật Vintage', shop: 'Tiệm Quà Handmade', category: 'Quà tặng', price: '250.000 ₫', stock: 12, sold: 45, status: 'active', image: 'https://placehold.co/100x100/e2e8f0/64748b?text=Box' },
  { id: 102, name: 'Gấu Bông Brown 1m2', shop: 'Gấu Bông Xinh', category: 'Thú bông', price: '550.000 ₫', stock: 5, sold: 120, status: 'active', image: 'https://placehold.co/100x100/e2e8f0/64748b?text=Bear' },
  { id: 103, name: 'Combo Nến Thơm Chill', shop: 'Candle Cup', category: 'Trang trí', price: '180.000 ₫', stock: 0, sold: 200, status: 'out_of_stock', image: 'https://placehold.co/100x100/e2e8f0/64748b?text=Candle' },
  { id: 104, name: 'Đồng Hồ Đôi Thời Trang', shop: 'Watch Store VN', category: 'Phụ kiện', price: '1.200.000 ₫', stock: 2, sold: 8, status: 'banned', image: 'https://placehold.co/100x100/e2e8f0/64748b?text=Watch' },
];

export default function ProductsClient() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Tất cả sản phẩm</h1>
          <button className="px-4 py-2 bg-white border border-gray-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-200 flex items-center gap-2">
             <FiTrash2 /> Thùng rác
          </button>
       </div>

       {/* Tabs Filter */}
       <div className="flex gap-6 border-b border-gray-200 text-sm">
          <button className="pb-3 border-b-2 border-[#E78720] text-[#E78720] font-semibold">Tất cả</button>
          <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Đang hoạt động</button>
          <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Hết hàng</button>
          <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Đã khóa/Vi phạm</button>
       </div>

       {/* Search & List */}
       <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex gap-4">
             <div className="relative flex-1 max-w-lg">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm sản phẩm, SKU hoặc tên Shop..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-[#E78720]" />
             </div>
          </div>

          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                   <th className="px-6 py-3 w-[40%]">Sản phẩm</th>
                   <th className="px-6 py-3">Giá & Kho</th>
                   <th className="px-6 py-3">Trạng thái</th>
                   <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                {MOCK_PRODUCTS.map(prod => (
                   <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex gap-3">
                            <img src={prod.image} className="w-16 h-16 rounded border border-gray-200 object-cover" alt={prod.name} />
                            <div>
                               <p className="font-medium text-gray-800 line-clamp-1">{prod.name}</p>
                               <p className="text-gray-500 text-xs mt-1">Shop: <span className="text-blue-600 hover:underline cursor-pointer">{prod.shop}</span></p>
                               <p className="text-gray-400 text-xs">Ngành hàng: {prod.category}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="font-medium text-[#E78720]">{prod.price}</p>
                         <p className="text-gray-500 text-xs mt-1">Kho: {prod.stock} | Đã bán: {prod.sold}</p>
                      </td>
                      <td className="px-6 py-4">
                         {prod.status === 'active' && <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Hoạt động</span>}
                         {prod.status === 'out_of_stock' && <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Hết hàng</span>}
                         {prod.status === 'banned' && <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">Đã khóa</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết trên sàn"><FiEye size={18} /></button>
                            <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Khóa sản phẩm vi phạm"><FiSlash size={18} /></button>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded"><FiMoreHorizontal size={18} /></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
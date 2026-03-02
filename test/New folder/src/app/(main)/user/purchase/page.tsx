'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { FileText, Search, Store, Truck } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ thanh toán' },
  { id: 'shipping', label: 'Vận chuyển' },
  { id: 'waiting', label: 'Chờ giao hàng' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

// Mock data
const ORDERS = [
  {
    id: 'ORD-123456',
    shopName: 'Xiaomi Official Store',
    status: 'completed',
    statusText: 'Giao hàng thành công',
    products: [
        {
            name: 'Điện thoại Xiaomi Redmi Note 13 Pro 8GB/128GB - Hàng Chính Hãng',
            image: 'https://placehold.co/400', // Thay bằng link ảnh thật
            variant: 'Đen, 128GB',
            quantity: 1,
            price: 5990000,
            originalPrice: 6500000
        }
    ],
    totalPrice: 5990000
  },
  {
    id: 'ORD-789012',
    shopName: 'Coolmate Official',
    status: 'shipping',
    statusText: 'Đơn hàng đang được vận chuyển',
    products: [
        {
            name: 'Áo thun nam Cotton Compact phiên bản nâng cấp',
            image: 'https://placehold.co/400',
            variant: 'Trắng, L',
            quantity: 2,
            price: 299000,
            originalPrice: 350000
        },
        {
            name: 'Quần short nam thể thao',
            image: 'https://placehold.co/400',
            variant: 'Xanh đen, L',
            quantity: 1,
            price: 199000,
            originalPrice: 250000
        }
    ],
    totalPrice: 797000
  }
];

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="bg-gray-50 min-h-[500px]">
      {/* Tabs Header */}
      <div className="bg-white sticky top-0 z-10 rounded-t-xl shadow-sm">
        <div className="flex w-full overflow-x-auto no-scrollbar border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-4 text-sm font-medium text-center border-b-2 transition-colors duration-300 ${
                activeTab === tab.id
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-600 hover:text-brand-orange'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="p-4 bg-gray-50/50">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm theo Tên Shop, ID Đơn hàng hoặc Tên Sản phẩm"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-brand-orange focus:bg-white transition-all outline-none"
                />
            </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {ORDERS.length > 0 ? (
             ORDERS.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-fade-in">
                    {/* Shop Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="bg-brand-orange text-white text-[10px] font-bold px-1 py-0.5 rounded">Yêu thích</span>
                            <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
                                <Store size={14} className="text-gray-500"/> {order.shopName}
                            </span>
                            <Link href="#" className="px-2 py-0.5 border border-gray-200 text-gray-500 text-xs rounded hover:bg-gray-50">Xem Shop</Link>
                        </div>
                        <div className="flex items-center gap-2 text-brand-orange text-sm font-medium">
                            <Truck size={16} />
                            <span className="uppercase">{order.statusText}</span>
                        </div>
                    </div>

                    {/* Product Items */}
                    <div className="space-y-4">
                        {order.products.map((product, idx) => (
                            <Link href={`/product-details/1`} key={idx} className="flex gap-4 group">
                                <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded-md overflow-hidden bg-gray-50">
                                     {/* Dùng thẻ img thay cho Image nếu chưa config domain */}
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-800 text-sm line-clamp-2 mb-1">{product.name}</h3>
                                    <p className="text-gray-500 text-xs mb-1">Phân loại hàng: {product.variant}</p>
                                    <p className="text-gray-800 text-xs">x{product.quantity}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {product.originalPrice && (
                                        <span className="text-gray-400 text-xs line-through">{product.originalPrice.toLocaleString('vi-VN')}₫</span>
                                    )}
                                    <span className="text-brand-orange text-sm font-medium">{product.price.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Footer Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-end items-center gap-2 mb-4">
                            <span className="text-gray-600 text-sm">Thành tiền:</span>
                            <span className="text-brand-orange text-xl font-bold">{order.totalPrice.toLocaleString('vi-VN')}₫</span>
                        </div>
                        
                        <div className="flex justify-end items-center gap-3">
                            <Button variant="secondary" className="!px-6 !py-2 !text-sm !h-10">Liên hệ Người bán</Button>
                            <Button variant="outline" className="!px-6 !py-2 !text-sm !h-10">Xem đánh giá</Button>
                            <Button className="!px-8 !py-2 !text-sm !h-10">Mua lại</Button>
                        </div>
                    </div>
                </div>
             ))
        ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-600">Chưa có đơn hàng nào</p>
            </div>
        )}
      </div>
    </div>
  );
}
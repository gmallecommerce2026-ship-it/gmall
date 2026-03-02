'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Plus, MapPin, MoreVertical } from 'lucide-react';

// Mock data
const ADDRESSES = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '(+84) 912 345 678',
    address: 'Số 123, Đường Lê Lợi, Phường Bến Thành, Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
    type: 'Nhà riêng'
  },
  {
    id: 2,
    name: 'Nguyễn Văn A',
    phone: '(+84) 987 654 321',
    address: 'Tòa nhà Bitexco, Số 2 Hải Triều',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
    type: 'Văn phòng'
  }
];

export default function AddressPage() {
  const [addresses, setAddresses] = useState(ADDRESSES);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
            <h1 className="text-xl font-bold text-gray-800">Địa chỉ của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý thông tin giao hàng</p>
        </div>
        <Button className="!px-4 !py-2.5 flex items-center gap-2 text-sm">
            <Plus size={16} /> Thêm địa chỉ mới
        </Button>
      </div>

      {/* Address List */}
      <div className="space-y-6">
        {addresses.map((addr) => (
            <div key={addr.id} className="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6 last:border-0">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-base">{addr.name}</span>
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <span className="text-gray-500 text-sm">{addr.phone}</span>
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                        <p>{addr.address}</p>
                        <p>{addr.city}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                        {addr.isDefault && (
                            <span className="border border-brand-orange text-brand-orange text-xs px-2 py-0.5 rounded font-medium">Mặc định</span>
                        )}
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">{addr.type}</span>
                    </div>
                </div>
                
                <div className="flex md:flex-col items-end justify-center gap-3 md:gap-2 mt-4 md:mt-0">
                    <div className="flex items-center gap-3">
                        <button className="text-blue-600 text-sm hover:underline font-medium">Cập nhật</button>
                        {!addr.isDefault && (
                            <button className="text-red-500 text-sm hover:underline">Xóa</button>
                        )}
                    </div>
                    <button 
                        className={`text-sm px-3 py-1.5 border rounded transition-colors ${addr.isDefault ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-600 hover:border-brand-orange hover:text-brand-orange'}`}
                        disabled={addr.isDefault}
                    >
                        Thiết lập mặc định
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
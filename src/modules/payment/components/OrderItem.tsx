// src/modules/payment/components/OrderItem.tsx
import React from 'react';

interface OrderItemProps {
  productId?: string;
  imageUrl: string;
  name: string;
  price: number | string; // [FIX] Cho phép cả number và string
  quantity: number;
  color?: string;
  size?: string;
}

const OrderItem: React.FC<OrderItemProps> = ({ imageUrl, name, price, quantity, color, size }) => {
  // Helper format giá
  const formatPrice = (p: number | string) => {
    const numPrice = typeof p === 'string' ? parseFloat(p.replace(/\D/g, '')) : p;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numPrice);
  };

  return (
    <div className="flex gap-3 py-2">
      <div className="w-16 h-16 flex-shrink-0 border border-gray-100 rounded overflow-hidden bg-gray-50">
        <img
          src={imageUrl || '/placeholder.png'}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <h4 className="text-sm text-gray-800 line-clamp-2">{name}</h4>
        <div className="flex justify-between items-end mt-1">
          <div className="text-xs text-gray-500">
             {color && <span className="mr-2">Màu: {color}</span>}
             {size && <span>Size: {size}</span>}
             <div className="mt-0.5">x{quantity}</div>
          </div>
          <span className="text-sm font-medium text-gray-900">{formatPrice(price)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
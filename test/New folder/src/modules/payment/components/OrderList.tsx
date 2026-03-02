// src/modules/payment/components/OrderList.tsx
import React from 'react';
import OrderItem from './OrderItem';

// Dữ liệu sản phẩm (đã được dọn dẹp)
const orderItemsData = [
  {
    id: 1,
    name: 'Áo thun cộc tay đơn giản',
    imageUrl: '/assets-payment/ImageAsset5.png', // Lấy ảnh từ code gốc
    color: 'xanh',
    size: 'S',
    price: '11.990.000',
    originalPrice: '14.690.000',
    quantity: 1,
  },
  {
    id: 2,
    name: 'Áo thun cộc tay đơn giản',
    imageUrl: '/assets-payment/ImageAsset2.png',
    color: 'đỏ',
    size: 'M',
    price: '11.990.000',
    originalPrice: '14.690.000',
    quantity: 1, // Số lượng 1 được suy ra từ code gốc
  },
];

const OrderList: React.FC = () => {
  return (
    // Thẻ card trắng chứa list sản phẩm
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 divide-y divide-gray-100">
      {orderItemsData.map((item) => (
        <OrderItem
          key={item.id}
          name={item.name}
          imageUrl={item.imageUrl}
          color={item.color}
          size={item.size}
          price={item.price}
          originalPrice={item.originalPrice}
          quantity={item.quantity}
        />
      ))}
    </div>
  );
};

export default OrderList;
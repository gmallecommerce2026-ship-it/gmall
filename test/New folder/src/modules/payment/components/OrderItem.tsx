// src/modules/payment/components/OrderItem.tsx
import React from 'react';
import Image from 'next/image'; // Giả sử bạn dùng Next.js

interface OrderItemProps {
  name: string;
  imageUrl: string;
  color: string;
  size: string;
  price: string;
  originalPrice?: string;
  quantity: number;
}

const OrderItem: React.FC<OrderItemProps> = ({
  name,
  imageUrl,
  color,
  size,
  price,
  originalPrice,
  quantity,
}) => {
  return (
    // Dùng py-6 cho item đầu và cuối, còn divide-y ở parent sẽ xử lý khoảng cách
    <div className="flex justify-between items-center w-full py-6 first:pt-0 last:pb-0">
      {/* Thông tin sản phẩm */}
      <div className="flex items-center gap-5">
        <Image
          src={imageUrl}
          alt={name}
          width={80} // Kích thước từ code gốc
          height={82}
          className="rounded-lg object-cover"
        />
        <div className="flex flex-col gap-1">
          <h4 className="font-poppins text-lg font-bold text-gray-800">
            {name}
          </h4>
          <p className="font-nunito text-sm font-medium text-gray-800">
            Màu: {color}
          </p>
          <p className="font-nunito text-sm font-medium text-gray-800">
            Size: {size}
          </p>
        </div>
      </div>

      {/* Số lượng */}
      <span className="font-raleway text-xl font-semibold text-gray-800">
        x{quantity}
      </span>

      {/* Giá */}
      <div className="flex flex-col items-end gap-1">
        <span className="font-poppins text-sm font-bold text-primary">
          {price} VND
        </span>
        {originalPrice && (
          <span className="font-poppins text-sm font-bold text-gray-300 line-through">
            {originalPrice} VND
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderItem;
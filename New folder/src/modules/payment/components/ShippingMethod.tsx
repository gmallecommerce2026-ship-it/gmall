// src/modules/payment/components/ShippingMethod.tsx
import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

// Refactor lại Component2 thành một component con nội bộ
interface ShippingOptionDetailProps {
  text: string;
  isTitle?: boolean;
  isBlack?: boolean;
}

const ShippingOptionDetail: React.FC<ShippingOptionDetailProps> = ({
  text,
  isTitle,
  isBlack,
}) => (
  <div
    className={`font-be-vietnam-pro whitespace-nowrap leading-none font-light ${
      isTitle ? 'text-[15px]' : 'text-[13px]' // Kích thước font tùy chỉnh
    } ${isBlack ? 'text-black' : 'text-gray-500'}`}
  >
    {text}
  </div>
);

// Dữ liệu (data1) đã refactor
const otherShippingOptions = [
  { id: 1, text: 'Hoả tốc - 4 giờ', isTitle: true, isBlack: true },
];

const ShippingMethod: React.FC = () => {
  const recommendedOption = {
    title: 'Nhanh',
    delivery: 'Nhận trong 24Th 10',
    voucher:
      'Nhận voucher trị giá 15.000 vnđ nếu đơn hàng được giao đến bạn sau ngày 24 Tháng 10 2025',
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-be-vietnam-pro text-xl font-medium text-black">
          Phương thức vận chuyển
        </h3>
        <button className="flex items-center gap-2 text-black font-be-vietnam-pro text-base font-light">
          Xem tất cả
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Lựa chọn đề xuất (màu cam) */}
      <div className="w-full bg-primary-light border border-primary rounded-2xl p-4 flex flex-col gap-1.5">
        <span className="font-be-vietnam-pro text-[15px] font-light text-black">
          {recommendedOption.title}
        </span>
        <span className="font-be-vietnam-pro text-[13px] font-light text-gray-500">
          {recommendedOption.delivery}
        </span>
        <span className="font-be-vietnam-pro text-[13px] font-light text-gray-500">
          {recommendedOption.voucher}
        </span>
      </div>

      {/* Lựa chọn khác (từ data1) */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-1.5">
        {otherShippingOptions.map((opt) => (
          <ShippingOptionDetail
            key={opt.id}
            text={opt.text}
            isTitle={opt.isTitle}
            isBlack={opt.isBlack}
          />
        ))}
      </div>

      {/* Dấu gạch ngang */}
      <div className="w-full h-px bg-gray-200 my-2" />

      {/* Tổng số tiền */}
      <div className="flex justify-between items-center w-full">
        <span className="font-be-vietnam-pro text-base font-light text-black">
          Tổng số tiền (2 Sản phẩm)
        </span>
        <span className="font-be-vietnam-pro text-base font-semibold text-black">
          23.980.000 VND
        </span>
      </div>
    </div>
  );
};

export default ShippingMethod;
// src/modules/payment/components/PaymentSummary.tsx
import React from 'react';
import PaymentSummaryRow from './PaymentSummaryRow';

// Dữ liệu (data3) đã refactor
const summaryData = [
  {
    id: 1,
    label: 'Giảm giá của cửa hàng',
    value: '-5.400.000 VND',
  },
  {
    id: 2,
    label: 'Tổng cộng voucher giảm giá',
    value: '-112,223.12 VND',
  },
  {
    id: 3,
    label: 'Tổng tiền phí vận chuyển',
    value: '15.000 VND',
    marginTop: 'mt-1', // 3px
  },
  {
    id: 4,
    label: 'Giảm giá phí vận chuyển',
    value: '-15.000 VND',
    marginTop: 'mt-1.5', // 5px
  },
  {
    id: 5,
    label: 'Giảm giá lovegifts xu',
    value: '-10.000 VND',
  },
];

const PaymentSummary: React.FC = () => {
  return (
    <div className="w-[391px] flex flex-col gap-3.5">
      {/* Thẻ chi tiết */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4.5 flex flex-col items-start">
        <h3 className="font-nunito text-base font-bold text-black">
          Chi tiết thanh toán
        </h3>

        {/* Tổng tiền hàng */}
        <PaymentSummaryRow
          label="Tổng tiền hàng"
          value="29.380.000 VND"
          marginTop="mt-1.5"
        />

        {/* Dấu gạch ngang */}
        <div className="w-full h-px bg-gray-200 my-2.5" />

        {/* Các mục giảm giá */}
        {summaryData.map((item) => (
          <PaymentSummaryRow
            key={item.id}
            label={item.label}
            value={item.value}
            marginTop={item.marginTop}
          />
        ))}

        {/* Dấu gạch ngang */}
        <div className="w-full h-px bg-gray-200 my-2.5" />

        {/* Tổng thanh toán */}
        <PaymentSummaryRow
          label="Tổng thanh toán"
          value="23,857,776.88 VND"
          valueColor="text-primary" // Màu cam cho tổng tiền
          marginTop="mt-2.5"
        />
      </div>

      {/* Nút Đặt hàng */}
      <button className="w-full bg-primary text-white font-outfit text-base font-medium h-[52px] rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors">
        Đặt hàng
      </button>
    </div>
  );
};

export default PaymentSummary;
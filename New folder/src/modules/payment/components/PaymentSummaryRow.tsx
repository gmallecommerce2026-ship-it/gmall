// src/modules/payment/components/PaymentSummaryRow.tsx
import React from 'react';

interface PaymentSummaryRowProps {
  label: string;
  value: string;
  valueColor?: string; // Tùy chọn màu cho giá trị (vd: màu cam)
  marginTop?: string; // Tùy chọn margin top
}

const PaymentSummaryRow: React.FC<PaymentSummaryRowProps> = ({
  label,
  value,
  valueColor = 'text-black', // Mặc định là màu đen
  marginTop = 'mt-2.5', // Mặc định 10px
}) => {
  return (
    <div className={`flex justify-between items-center w-full ${marginTop}`}>
      <span className="font-nunito text-xs font-normal text-black">
        {label}
      </span>
      <span
        className={`font-nunito text-base font-bold whitespace-nowrap ${valueColor}`}
      >
        {value}
      </span>
    </div>
  );
};

export default PaymentSummaryRow;
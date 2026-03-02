// src/modules/payment/components/PaymentSummary.tsx
import React from 'react';

// Component con để hiển thị từng dòng
const SummaryRow = ({ 
  label, 
  value, 
  color = "text-gray-800", 
  isBold = false, 
  marginTop = "mt-2",
  isNegative = false // Thêm flag để tự động thêm dấu trừ nếu cần
}: { 
  label: string; 
  value: string | number; 
  color?: string; 
  isBold?: boolean;
  marginTop?: string;
  isNegative?: boolean;
}) => {
  const displayValue = typeof value === 'number' ? value : 0;
  
  // LOGIC QUAN TRỌNG: Nếu giá trị bằng 0 và là dòng giảm giá (negative) -> Ẩn luôn cho gọn
  if (isNegative && displayValue === 0) return null;

  const formattedValue = typeof value === 'string' 
    ? value 
    : `${isNegative && displayValue > 0 ? '-' : ''}${displayValue.toLocaleString('vi-VN')} đ`;

  return (
    <div className={`flex justify-between items-center w-full ${marginTop}`}>
      <span className="font-nunito text-sm text-gray-600">{label}</span>
      <span className={`font-poppins text-sm ${isBold ? 'font-bold' : 'font-medium'} ${color}`}>
        {formattedValue}
      </span>
    </div>
  );
};

interface PaymentSummaryProps {
  subtotal: number;          // 1. Tổng tiền hàng
  shopDiscount: number;      // 2. Giảm giá của cửa hàng
  systemDiscount: number;    // 3. Tổng cộng voucher giảm giá
  shippingFee: number;       // 4. Tổng tiền phí vận chuyển
  shippingDiscount: number;  // 5. Giảm giá phí vận chuyển
  coinDiscount: number;      // 6. Giảm giá G-Mall xu [NEW]
  total: number;             // Tổng thanh toán
  onPlaceOrder: () => void;
  loading?: boolean;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  subtotal,
  shopDiscount,
  systemDiscount,
  shippingFee,
  shippingDiscount,
  coinDiscount,
  total,
  onPlaceOrder,
  loading = false,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Khung chi tiết thanh toán */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-nunito text-base font-bold text-black mb-1 border-b pb-3">
          Chi tiết thanh toán
        </h3>

        {/* 1. Tổng tiền hàng */}
        <SummaryRow
          label="Tổng tiền hàng"
          value={subtotal}
          marginTop="mt-3"
        />

        {/* 2. Giảm giá của cửa hàng */}
        <SummaryRow
          label="Giảm giá của cửa hàng"
          value={shopDiscount}
          isNegative={true}
        />

        {/* 3. Tổng cộng voucher giảm giá */}
        <SummaryRow
            label="Tổng cộng voucher giảm giá"
            value={systemDiscount}
            isNegative={true}
        />

        {/* 4. Tổng tiền phí vận chuyển */}
        <SummaryRow
          label="Tổng tiền phí vận chuyển"
          value={shippingFee}
        />

        {/* 5. Giảm giá phí vận chuyển */}
        <SummaryRow
          label="Giảm giá phí vận chuyển"
          value={shippingDiscount}
          color="text-green-600"
          isNegative={true}
        />

        {/* 6. Giảm giá G-Mall xu [HIỂN THỊ NẾU CÓ DÙNG XU] */}
        <SummaryRow
          label="Giảm giá G-Mall xu"
          value={coinDiscount}
          color="text-orange-500"
          isNegative={true}
        />

        {/* Dấu gạch ngang phân cách */}
        <div className="w-full h-px bg-gray-200 my-4" />

        {/* Tổng thanh toán */}
        <div className="flex justify-between items-center w-full">
          <span className="text-base font-bold text-gray-800">Tổng thanh toán</span>
          <span className="text-xl font-bold text-orange-600 font-poppins">
            {total.toLocaleString('vi-VN')} đ
          </span>
        </div>
        
        <div className="w-full text-right text-xs text-gray-400 mt-1">
            (Đã bao gồm VAT nếu có)
        </div>
      </div>

      {/* Nút Đặt hàng */}
      <button 
        onClick={onPlaceOrder}
        disabled={loading}
        className={`w-full font-outfit text-lg font-bold h-[52px] rounded-lg flex items-center justify-center transition-all shadow-md
          ${loading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg active:scale-[0.99]'
          }
        `}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "ĐẶT HÀNG"
        )}
      </button>

      {/* Trust Badge */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-center select-none">
          <div className="text-[10px] text-gray-500 flex flex-col items-center gap-1">
              <span className="text-green-600 text-lg">🛡️</span> Bảo mật 100%
          </div>
          <div className="text-[10px] text-gray-500 flex flex-col items-center gap-1">
              <span className="text-blue-600 text-lg">↩️</span> Đổi trả 7 ngày
          </div>
          <div className="text-[10px] text-gray-500 flex flex-col items-center gap-1">
              <span className="text-orange-600 text-lg">⚡</span> Giao siêu tốc
          </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
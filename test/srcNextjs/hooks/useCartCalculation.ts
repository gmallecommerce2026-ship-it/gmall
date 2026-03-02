// src/hooks/useCartCalculation.ts
import { useMemo } from 'react';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { Voucher } from '@/services/voucher.service';

interface CalculationParams {
  originalTotal: number; // Tổng tiền hàng
  shippingFee: number;   // Phí vận chuyển
  useCoins: boolean;     // Có dùng xu không
  coinBalance: number;   // Số dư xu hiện tại
}

export const useCartCalculation = ({
  originalTotal,
  shippingFee,
  useCoins,
  coinBalance
}: CalculationParams) => {
  const { selectedShopVoucher, selectedSystemVoucher } = useCheckoutStore();

  const calculateVoucherDiscount = (baseAmount: number, voucher: Voucher | null) => {
    if (!voucher) return 0;
    if (baseAmount < voucher.minOrderValue) return 0;

    let discount = 0;
    if (voucher.type === 'FIXED_AMOUNT') {
      discount = voucher.amount;
    } else {
      discount = (baseAmount * voucher.amount) / 100;
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    }
    return discount;
  };

  const totals = useMemo(() => {
    // 1. Giảm giá của Shop (Tính trên tổng tiền hàng)
    const shopDiscount = calculateVoucherDiscount(originalTotal, selectedShopVoucher);
    const subtotalAfterShop = Math.max(0, originalTotal - shopDiscount);

    // 2. Giảm giá phí vận chuyển (Theo yêu cầu: Voucher sàn tính vào phí vận chuyển)
    // Lưu ý: Thông thường giảm giá vận chuyển không vượt quá phí vận chuyển, 
    // nhưng nếu voucher sàn là giảm giá đơn hàng thì logic này sẽ trừ vào phí ship trước.
    // Ở đây tôi để giảm giá tối đa bằng giá trị voucher tính ra.
    let shippingDiscount = calculateVoucherDiscount(subtotalAfterShop, selectedSystemVoucher);
    
    // Logic phụ: Nếu bạn muốn giảm giá vận chuyển không được vượt quá phí vận chuyển thực tế:
    // shippingDiscount = Math.min(shippingDiscount, shippingFee); 
    // (Bỏ comment dòng trên nếu muốn chặn trần)

    // 3. Giảm giá G-Mall Xu
    // Giả sử 1 Xu = 1 VND. Logic: Dùng xu nếu được tick, tối đa không quá 50% đơn hoặc full số dư
    let coinDiscount = 0;
    if (useCoins && coinBalance > 0) {
      // Ví dụ: Chỉ cho phép dùng xu thanh toán tối đa 50% giá trị còn lại (tùy logic dự án)
      const currentTotal = subtotalAfterShop + shippingFee - shippingDiscount;
      const maxCoinUsable = currentTotal; // Hoặc currentTotal * 0.5
      coinDiscount = Math.min(coinBalance, maxCoinUsable);
    }

    // 4. Tổng cộng voucher giảm giá (Trường này hiện tại = 0 vì Voucher Sàn đã đẩy sang ShippingDiscount)
    // Nếu có loại voucher thứ 3 thì cộng vào đây.
    const systemDiscount = 0; 

    // 5. Tổng thanh toán cuối cùng
    const total = Math.max(0, subtotalAfterShop + shippingFee - shippingDiscount - systemDiscount - coinDiscount);

    return {
      subtotal: originalTotal,
      shopDiscount,
      systemDiscount, // Hiện tại đang là 0 do requirement đẩy voucher sàn qua shipping
      shippingFee,
      shippingDiscount,
      coinDiscount,
      total,
    };
  }, [originalTotal, shippingFee, selectedShopVoucher, selectedSystemVoucher, useCoins, coinBalance]);

  return totals;
};
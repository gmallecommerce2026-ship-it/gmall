import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Stores
import { useCartData, useCartActions } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserStore } from '@/store/useUserStore';

// Services & Types
import { OrderService, CreateOrderPayload } from '@/services/order.service';

export const useCheckoutLogic = () => {
  const router = useRouter();

  // 1. Lấy dữ liệu từ các Store
  const { isAuthenticated } = useUserStore();
  
  // Cart Data (Dùng khi mua từ giỏ hàng)
  const { items: cartItems, selectedIds, totalSelectedPrice: cartTotal } = useCartData();
  const { removeMultipleItems } = useCartActions();
  
  // Checkout Data (Dùng chung + Mua ngay)
  const { 
    receiverInfo, 
    senderInfo, 
    shopVouchers, 
    shopShipping, 
    shopMessages, 
    selectedSystemVoucher,
    resetCheckout,
    // [NEW] State mua ngay
    isBuyNowFlow,
    checkoutItems,
    appliedCoins
  } = useCheckoutStore();

  // 2. Local State cho UI
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // [NEW] Helper: Xác định danh sách items sẽ được thanh toán
  const validPaymentItems = useMemo(() => {
    if (isBuyNowFlow) {
       // Nếu là luồng Mua Ngay -> Lấy từ checkoutItems
       return checkoutItems;
    }
    // Nếu là luồng Giỏ Hàng -> Lấy từ cartItems dựa trên selectedIds
    return cartItems.filter(item => selectedIds.includes(item.id));
  }, [isBuyNowFlow, checkoutItems, cartItems, selectedIds]);

  // [NEW] Helper: Tính tổng tiền hiển thị ban đầu (khi chưa có preview từ BE)
  const displayTotal = useMemo(() => {
      if (isBuyNowFlow) {
          return checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      }
      return cartTotal;
  }, [isBuyNowFlow, checkoutItems, cartTotal]);

  // 3. Hàm Mapping: Store -> DTO Backend
  const buildPayload = (paymentMethod: 'cod' | 'pay2s' | 'momo' | 'banking', isPreview = false): CreateOrderPayload | null => {
    
    // [FIX] Sử dụng validPaymentItems đã lọc sẵn ở trên
    if (validPaymentItems.length === 0) {
      if (!isPreview) toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return null;
    }

    // Validate info
    if (!isPreview && (!receiverInfo.name || !receiverInfo.phone || !receiverInfo.address)) {
      toast.error("Vui lòng nhập đầy đủ địa chỉ nhận hàng");
      return null;
    }

    // Gom Voucher
    const voucherIds: string[] = [];
    if (selectedSystemVoucher?.id) voucherIds.push(selectedSystemVoucher.id);
    Object.values(shopVouchers).forEach(voucher => {
      if (voucher?.id) voucherIds.push(voucher.id);
    });

    // Transform Items
    const orderItems = validPaymentItems.map(item => ({
      productId: String(item.productId),
      variantId: item.productVariantId ? String(item.productVariantId) : undefined,
      quantity: item.quantity
    }));

    return {
      isBuyNow: isBuyNowFlow, // [IMPORTANT] Truyền cờ này lên BE
      items: orderItems,
      voucherIds: voucherIds,
      
      receiverInfo: {
        name: receiverInfo.name,
        phone: receiverInfo.phone,
        address: receiverInfo.address,
      },
      
      senderInfo: {
        name: senderInfo.name,
        message: senderInfo.message,
      },

      note: shopMessages, 
      paymentMethod: paymentMethod,
      
      giftWrapIndex: 0,
      cardIndex: 0,
      useCoins: appliedCoins > 0,
      appliedCoins: appliedCoins, 
    };
  };

  // 4. Hàm Preview
  const handlePreviewOrder = async () => {
    // Nếu chưa có items thì không preview
    if (validPaymentItems.length === 0) return;

    const payload = buildPayload('cod', true);
    if (!payload) return;

    try {
      const data = await OrderService.previewOrder(payload);
      setPreviewData(data);
    } catch (error: any) {
      console.error("Preview error:", error);
    }
  };

  // Trigger preview
  useEffect(() => {
    if (validPaymentItems.length > 0 && isAuthenticated) {
      const timer = setTimeout(() => {
          handlePreviewOrder();
      }, 500); // Debounce nhẹ 500ms
      return () => clearTimeout(timer);
    }
  }, [validPaymentItems, shopVouchers, selectedSystemVoucher, isAuthenticated, appliedCoins]);


  // 5. Hàm Checkout
  const handleCheckout = async (paymentMethod: 'cod' | 'pay2s' | 'momo' | 'banking') => {
    setIsLoading(true);
    const payload = buildPayload(paymentMethod);

    if (!payload) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await OrderService.createOrder(payload);

      toast.success("Đặt hàng thành công!");
      
      // [LOGIC QUAN TRỌNG]: Chỉ xóa giỏ hàng nếu KHÔNG phải là Mua Ngay
      if (!isBuyNowFlow) {
         await removeMultipleItems(selectedIds);
      }
      
      // Reset store (Xóa cả state mua ngay lẫn state checkout thường)
      resetCheckout();

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        const orderIds = response.orders.map(o => o.id).join(',');
        router.push(`/payment/success?orderIds=${orderIds}`);
      }

    } catch (error: any) {
      console.error("Checkout Error:", error);
      const msg = error?.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCheckout,
    handlePreviewOrder,
    previewData,
    isLoading,
    // Trả về danh sách items đang được thanh toán để UI hiển thị (thay vì cartItems)
    checkoutItems: validPaymentItems, 
    totalSelectedPrice: displayTotal 
  };
};
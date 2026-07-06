"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/ApiClient';

// Import các hooks chuẩn từ store (Giống useCheckoutLogic.ts)
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserStore } from '@/store/useUserStore';
import { useCartData, useCartActions } from '@/store/useCartStore'; 

import { encodeData, decodeData } from '@/lib/url-helper';
import OrderSummaryBox from '@/components/common/OrderSummaryBox';
import { giftWrapData, greetingCardData } from './data';
import GiftWrapCard from './components/GiftWrapCard';
import VoucherSection from '@/modules/payment/components/VoucherSection';

// --- CONSTANTS ---
const PAYMENT_METHODS = [
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '/assets-gift-payment/ImageAsset5.png' },
  { id: 'paypal', name: 'Thanh toán qua PayPal', icon: '/assets-gift-payment/ImageAsset7.png' },
  { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '/assets-gift-payment/ImageAsset8.png' },
];

const GiftPaymentPage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. LẤY DATA TỪ STORE GIỐNG HỆT NHƯ useCheckoutLogic
  const { items: cartItems, selectedIds } = useCartData();
  const { removeMultipleItems } = useCartActions();
  const { 
    isBuyNowFlow, 
    checkoutItems,
    senderInfo, setSenderInfo, 
    receiverInfo, setReceiverInfo,
    selectedVoucherId, 
    setSelectedVoucher
  } = useCheckoutStore();

  // Auth guard
  const isAuthenticated = useUserStore(s => s.isAuthenticated);
  const hasHydrated = useUserStore(s => s._hasHydrated);
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      const next = encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/gift-payment');
      router.replace(`/login?next=${next}`);
    }
  }, [hasHydrated, isAuthenticated, router]);
  
  const dataParam = searchParams.get('data');
  const updatedVoucher = searchParams.get('updated_voucher');

  const [orderData, setOrderData] = useState<any>({
    items: [], subtotal: 0, shippingFee: 0, shippingDiscount: 0,
    voucherDiscount: 0, coinDiscount: 0, giftWrapFee: 0, total: 0
  });
  
  const [useCoins, setUseCoins] = useState(false);
  const [voucherId, setVoucherId] = useState<string | undefined>(
    selectedVoucherId || (updatedVoucher ? 'DEMO_COMPLEX' : undefined)
  );
  const [orderPreview, setOrderPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedGiftWrap, setSelectedGiftWrap] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('cod');

  useEffect(() => {
    if (selectedVoucherId) {
        setVoucherId(selectedVoucherId);
    }
  }, [selectedVoucherId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. LOGIC TÌM SẢN PHẨM CHÍNH XÁC (Tránh lỗi giỏ hàng trống)
  const validPaymentItems = useMemo(() => {
    if (isBuyNowFlow) return checkoutItems;
    return cartItems.filter(item => selectedIds.includes(item.id));
  }, [isBuyNowFlow, checkoutItems, cartItems, selectedIds]);

  // --- EFFECT 1: XỬ LÝ URL PARAMS ---
  useEffect(() => {
    if (!isMounted) return;
    const currentParams = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    if (currentParams.has('updated_sender')) {
        const decoded = decodeData(currentParams.get('updated_sender'));
        if (decoded) setSenderInfo({ ...senderInfo, ...decoded });
        currentParams.delete('updated_sender');
        hasChanges = true;
    }

    if (currentParams.has('updated_receiver')) {
        const decoded = decodeData(currentParams.get('updated_receiver'));
        if (decoded) setReceiverInfo({ ...receiverInfo, ...decoded });
        currentParams.delete('updated_receiver');
        hasChanges = true;
    }

    if (currentParams.has('updated_voucher')) {
        const vId = currentParams.get('updated_voucher') || '';
        setSelectedVoucher(vId);
        currentParams.delete('updated_voucher');
        hasChanges = true;
    }

    if (hasChanges) {
        router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, searchParams]);

  // --- EFFECT 2: GỌI API TÍNH TIỀN ---
  useEffect(() => {
    if (!isMounted) return;

    const fetchPreview = async () => {
      // NẾU KHÔNG CÓ ITEM NÀO -> DỪNG LẠI CHỜ RENDER UI GIỎ HÀNG TRỐNG
      if (validPaymentItems.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const isGiftWrapping = selectedGiftWrap !== null;
        
        // Transform items cho BE giống hệt luồng Checkout
        const orderItems = validPaymentItems.map(item => ({
          productId: String(item.productId),
          variantId: item.productVariantId ? String(item.productVariantId) : undefined,
          quantity: item.quantity
        }));

        const res = await apiClient.post('/orders/preview', {
          isBuyNow: isBuyNowFlow,
          items: orderItems,
          voucherId: voucherId,
          useCoins: useCoins,
          isGift: isGiftWrapping 
        });
        
        if (res) {
            setOrderData(res);
            setOrderPreview(res);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timeoutId);

  }, [isMounted, validPaymentItems, isBuyNowFlow, voucherId, useCoins, selectedGiftWrap]); 

  // Navigation Handlers
  const handleEditInfo = (type: 'sender' | 'receiver') => {
    const infoData = type === 'sender' ? senderInfo : receiverInfo;
    const infoEncoded = encodeData(infoData);
    router.push(`/checkout/edit-address?type=${type}&backUrl=/gift-payment&info=${infoEncoded}`);
  };

  const handleSelectVoucher = () => {
    router.push(`/checkout/vouchers?backUrl=/gift-payment&selected=${voucherId || ''}`);
  };

  const handleOrder = async () => {
    if (!senderInfo.name || !senderInfo.phone || !senderInfo.address) {
        toast.error("Vui lòng điền thông tin người tặng");
        return;
    }
    if (!receiverInfo.name || !receiverInfo.phone || !receiverInfo.address) {
        toast.error("Vui lòng điền thông tin người nhận");
        return;
    }
    if (selectedPayment !== 'cod') {
        toast.error("Vui lòng chọn thanh toán COD (Đang bảo trì Online).");
        return;
    }

    try {
        setLoading(true);
        toast.loading("Đang tạo đơn hàng quà tặng...");
        
        const orderItems = validPaymentItems.map(item => ({
          productId: String(item.productId),
          variantId: item.productVariantId ? String(item.productVariantId) : undefined,
          quantity: item.quantity
        }));

        await apiClient.post('/orders', {
            isGift: true,
            isBuyNow: isBuyNowFlow,
            senderInfo,
            receiverInfo,
            items: orderItems,
            paymentMethod: selectedPayment,
            voucherId: voucherId,
            useCoins: useCoins,
            giftWrapIndex: selectedGiftWrap,
            cardIndex: selectedCard,
            totalAmount: orderData.total 
        });

        // XÓA ĐÚNG SẢN PHẨM NẾU MUA TỪ GIỎ HÀNG
        if (!isBuyNowFlow) {
            await removeMultipleItems(selectedIds);
        }

        toast.dismiss();
        toast.success("Đặt hàng quà tặng thành công!");
        router.push('/payment/success'); 

    } catch (err: any) {
        toast.dismiss();
        toast.error(err.message || "Có lỗi xảy ra khi tạo đơn.");
    } finally {
        setLoading(false);
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // SỬ DỤNG validPaymentItems ĐỂ CHECK GIỎ HÀNG TRỐNG
  if (validPaymentItems.length === 0) {
      return <div className="p-8 text-center text-gray-500">Giỏ hàng trống. <span className="text-brand-orange cursor-pointer" onClick={()=>router.push('/')}>Về trang chủ</span></div>;
  }

  return (
   <div className="w-full max-w-[1175px] mx-auto py-6 px-4 font-sans bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-base mb-6">
         <div className="flex items-center gap-2 text-black/60 cursor-pointer hover:text-brand-orange" onClick={() => router.push('/')}>
            <span>Trang chủ</span>
            <img src="/assets-gift-payment/SvgAsset10.svg" alt="arrow" className="transform rotate-90 w-3 h-3" />
         </div>
         <div className="flex items-center gap-2 text-black/60 cursor-pointer hover:text-brand-orange" onClick={() => router.push('/cart')}>
            <span>Giỏ hàng</span>
            <img src="/assets-gift-payment/SvgAsset9.svg" alt="arrow" className="transform rotate-90 w-3 h-3" />
         </div>
         <div className="text-black font-normal font-medium">Thanh toán quà tặng</div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
         
         {/* --- CỘT TRÁI --- */}
         <div className="flex flex-col w-full lg:flex-1 gap-4">
         
            {/* 1. NGƯỜI TẶNG */}
            <div 
                onClick={() => handleEditInfo('sender')}
                className="bg-white p-6 rounded-[15px] border border-[#e78720] shadow-[0_4px_20px_rgba(231,135,32,0.08)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md cursor-pointer group"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xl text-black font-bold group-hover:text-brand-orange transition-colors">{senderInfo.name || "Chưa có tên"}</span>
                        <span className="text-base text-[#414141] font-normal">{senderInfo.relation || "(Người tặng)"}</span>
                        <span className="text-[15px] text-[#7a7b7b] font-normal">{senderInfo.phone || "SĐT"}</span>
                    </div>
                    <span className="text-base text-[#414141] font-normal line-clamp-1">{senderInfo.address || "Vui lòng chọn địa chỉ..."}</span>
                </div>
                <div className="relative w-8 h-8 flex-shrink-0 self-end sm:self-center">
                    <img className="w-full h-full" src="/assets-gift-payment/SvgAsset11.svg" alt="Edit" />
                </div>
            </div>

            {/* 2. SẢN PHẨM */}
            <div className="bg-white p-6 rounded-[15px] border border-[#f0f0f0] flex flex-col gap-6">
                {orderPreview?.items?.map((item: any) => (
                    <div key={item.productId} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img src={item.image?.url || '/assets/placeholder.png'} className="w-full h-full object-cover mix-blend-multiply"/>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Số lượng: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
                        </div>
                        <div className="font-bold text-brand-orange text-lg whitespace-nowrap">
                            {item.subtotal.toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. NGƯỜI NHẬN & GÓI QUÀ */}
            <div className="bg-white p-6 rounded-[15px] border border-[#f0f0f0] flex flex-col gap-6">
                <h3 className="font-['Be_Vietnam_Pro'] text-xl font-bold text-black">Thông tin người nhận</h3>
                
                <div 
                    onClick={() => handleEditInfo('receiver')}
                    className="border border-[#f0f0f0] border-l-4 border-l-brand-orange bg-gray-50/50 rounded-r-lg p-4 flex justify-between items-start gap-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xl text-black font-bold group-hover:text-brand-orange transition-colors">{receiverInfo.name || "Tên người nhận"}</span>
                            <span className="text-base text-[#414141]">{receiverInfo.relation}</span>
                            <span className="text-[13px] text-[#7a7b7b]">{receiverInfo.phone}</span>
                        </div>
                        {receiverInfo.message && (
                            <p className="text-[14px] text-gray-600 italic leading-relaxed bg-white p-3 rounded border border-dashed border-gray-300 w-full">
                                "{receiverInfo.message}"
                            </p>
                        )}
                        <p className="text-base text-[#414141] font-medium">
                            <span className="text-brand-orange">Gửi đến:</span> {receiverInfo.address || "Chưa có địa chỉ"}
                        </p>
                    </div>
                    <button className="p-2 bg-white rounded-full shadow-sm">
                        <img src="/assets-gift-payment/SvgAsset26.svg" alt="edit" className="w-3 h-5" />
                    </button>
                </div>

                {/* Danh sách Gói Quà */}
                <div className="border border-[#eaeaea] rounded-[15px] p-4 flex flex-col gap-3">
                    <span className="text-[15px] font-bold text-black">Gói quà tặng</span>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {giftWrapData.map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => setSelectedGiftWrap(selectedGiftWrap === index ? null : index)}
                                className={`
                                    cursor-pointer rounded-[20px] p-[2px] transition-all duration-200 flex-shrink-0
                                    ${selectedGiftWrap === index ? 'ring-2 ring-brand-orange scale-105 shadow-md' : 'hover:opacity-80'}
                                `}
                            >
                                <GiftWrapCard {...item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. VOUCHER SECTION (GIAO DIỆN MỚI) */}
            <VoucherSection 
                onSelectVoucher={handleSelectVoucher}
                selectedVoucherText={voucherId ? "Đã áp dụng mã giảm giá" : "Chọn hoặc nhập mã"}
                discountAmount={orderData.voucherDiscount}
                useCoins={useCoins}
                onToggleCoins={setUseCoins}
                coinBalance={10000} // Mock số dư
            />

            {/* 5. PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white p-6 rounded-[15px] border border-[#f0f0f0] flex flex-col gap-4 shadow-sm">
                <h3 className="text-xl font-bold text-black">Phương thức thanh toán</h3>
                <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map((method) => (
                        <div 
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`
                                border rounded-[15px] p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 relative
                                ${selectedPayment === method.id 
                                    ? 'border-[#e78720] bg-[#e78720]/10 shadow-inner' 
                                    : 'border-[#eaeaea] hover:bg-gray-50 hover:border-gray-300' 
                                }
                            `}
                        >
                            <img src={method.icon} alt={method.name} className="w-[100px] h-[34px] rounded-[4px] object-contain bg-white border border-gray-100" />
                            <span className={`text-[16px] flex-1 ${selectedPayment === method.id ? 'font-medium text-black' : 'font-light text-black'}`}>
                                {method.name}
                            </span>
                            {selectedPayment === method.id ? (
                                <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center shadow-sm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

         </div>

         {/* --- CỘT PHẢI (STICKY) --- */}
         <div className="w-full lg:w-[392px]">
            <OrderSummaryBox 
                subtotal={orderData.subtotal}
                shippingFee={orderData.shippingFee}
                shippingDiscount={orderData.shippingDiscount}
                voucherDiscount={orderData.voucherDiscount}
                coinDiscount={orderData.coinDiscount}
                giftWrapFee={orderData.giftWrapFee} 
                total={orderData.total}
                onPlaceOrder={handleOrder}
                buttonText="Thanh toán ngay"
                loading={false}
            />
         </div>
      </div>
   </div>
   );
}

export default GiftPaymentPage;
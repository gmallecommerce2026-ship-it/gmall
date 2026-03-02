"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/ApiClient';
import { shippingOptionsData } from '@/modules/gift-payment/data'; 
import ShippingOption from '@/modules/gift-payment/components/ShippingOption';
import OrderSummaryBox from '@/components/common/OrderSummaryBox';
import VoucherSection from '@/modules/payment/components/VoucherSection';
import { useCartStore } from '@/store/useCartStore';
import { useTracking, EventType } from "@/hooks/useTracking";

// --- Interfaces & Types ---
interface UserInfo {
  name: string;
  phone: string;
  address: string;
}

// Mock Payment Methods
const PAYMENT_METHODS = [
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '/assets-gift-payment/ImageAsset5.png' },
  { id: 'momo', name: 'Thanh toán qua MoMo', icon: '/assets-gift-payment/ImageAsset6.png' },
  { id: 'paypal', name: 'Thanh toán qua PayPal', icon: '/assets-gift-payment/ImageAsset7.png' },
  { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '/assets-gift-payment/ImageAsset8.png' },
];

// --- Edit Modal (Reusable Logic) ---
const EditInfoModal = ({ 
  isOpen, onClose, title, data, onSave 
}: { 
  isOpen: boolean; onClose: () => void; title: string; data: UserInfo; onSave: (newData: UserInfo) => void;
}) => {
  const [formData, setFormData] = useState(data);
  useEffect(() => { setFormData(data) }, [data, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold mb-4 text-brand-orange">{title}</h3>
        <div className="flex flex-col gap-3">
          <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange" placeholder="Tên" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange" placeholder="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
          <button onClick={() => { onSave(formData); onClose(); }} className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:opacity-90 transition-colors shadow-lg shadow-orange-200">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
};

const PaymentPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dataParam = searchParams.get('data');
  const updatedVoucher = searchParams.get('updated_voucher');
  const { track } = useTracking();

  // Order State
  const [orderData, setOrderData] = useState<any>({
    items: [], subtotal: 0, shippingFee: 0, shippingDiscount: 0,
    voucherDiscount: 0, coinDiscount: 0, total: 0
  });
  
  // UI States
  const [orderPreview, setOrderPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Logic States
  const [useCoins, setUseCoins] = useState(false);
  const [voucherId, setVoucherId] = useState<string | undefined>(updatedVoucher ? 'DEMO_COMPLEX' : undefined);
  
  // Selection States
  const [selectedShipping, setSelectedShipping] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<string>('cod');
  const { clearCart } = useCartStore();

  // User Info States (Default Mock)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "Nguyễn Văn B",
    phone: "(+84) 12356899",
    address: "Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội"
  });

  const [isEditingUser, setIsEditingUser] = useState(false);

  // --- Navigation Handlers ---
  const goToEditAddress = () => {
    const currentParams = searchParams.toString();
    router.push(`/checkout/edit-address?type=buyer&backUrl=/payment&${currentParams}`);
  };

  const goToSelectVoucher = () => {
    const currentParams = searchParams.toString();
    router.push(`/checkout/vouchers?backUrl=/payment&data=${dataParam || ''}&selected=${voucherId || ''}`);
  };

  // Tracking: View Checkout Page
  useEffect(() => {
    if (orderPreview) {
      track(EventType.VIEW_PRODUCT, 'checkout_page', { 
        step: 1, 
        value: orderPreview.total,
        currency: 'VND' 
      });
    }
  }, [orderPreview, track]);

  // Tracking: Chọn Shipping
  useEffect(() => {
     if (selectedShipping !== null && shippingOptionsData[selectedShipping]) {
        track('add_shipping_info', 'shipping_method', { method: shippingOptionsData[selectedShipping].text });
     }
  }, [selectedShipping, track]);

  // --- API Effects (Memoized for Performance) ---
  const fetchPreview = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      let items = [];
      if (dataParam) {
        try {
          items = JSON.parse(atob(dataParam));
        } catch (e) { 
          console.error("Lỗi parse items:", e); 
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
         setErrorMsg("Bạn chưa đăng nhập. Vui lòng đăng nhập để thanh toán.");
         setLoading(false);
         return;
      }

      // API Call
      // [FIX]: Gửi voucherIds dạng mảng để khớp với Backend mới
      const res = await apiClient.post('/orders/preview', {
        isBuyNow: !!items.length,
        items: items.length ? items : undefined,
        voucherIds: voucherId ? [voucherId] : [], // <--- SỬA TẠI ĐÂY
        useCoins: useCoins,
        isGift: false
      });
      
      if(res) {
        setOrderData(res);
        setOrderPreview(res);
      }

    } catch (error: any) {
      console.error("API Error Full:", error);
      const message = error?.message || "Không thể kết nối đến máy chủ.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dataParam, voucherId, useCoins]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Sync Voucher from URL
  useEffect(() => {
      if (updatedVoucher) {
          setVoucherId('DEMO_COMPLEX'); 
      } else {
          setVoucherId(undefined);
      }
  }, [updatedVoucher]);

  // --- Order Handler ---
  const handleOrder = async () => {
    // 1. [TRACKING]: Track hành vi bấm nút để đo Intent (ý định mua)
    track('click_place_order', 'checkout_page_button', {
        payment_method: selectedPayment,
        total_value: orderData.total
    });

    if (selectedPayment !== 'cod') {
        toast.error("Hệ thống đang bảo trì cổng thanh toán online. Vui lòng chọn COD.");
        return;
    }

    try {
        setProcessing(true);
        toast.loading("Đang xử lý đơn hàng...");
        
        // 2. Gọi API tạo đơn hàng (Server sẽ tự track PURCHASE)
        await apiClient.post('/orders', {
            // [FIX]: Không spread ...orderData vì nó chứa dữ liệu tính toán
            // Chỉ gửi thông tin cần thiết để BE tính lại
            items: orderData.items?.map((i: any) => ({ productId: i.productId, quantity: i.quantity })),
            userInfo,
            paymentMethod: selectedPayment,
            voucherIds: voucherId ? [voucherId] : [], // <--- SỬA TẠI ĐÂY
            useCoins,
            isBuyNow: !!dataParam
        });
        
        // 3. Xóa giỏ hàng ở Frontend Store
        if (!dataParam) { 
            clearCart(); 
        } else {
            clearCart(); 
        }
        
        toast.dismiss();
        toast.success("Đặt hàng thành công!");
        router.push('/payment/success');
    } catch (err: any) {
        toast.dismiss();
        toast.error(err.message || "Có lỗi xảy ra khi tạo đơn.");
    } finally {
        setProcessing(false);
    }
  };

  // --- Render Conditionals ---
  if (errorMsg) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 font-bold text-lg">Đã có lỗi xảy ra!</div>
        <div className="text-gray-600">{errorMsg}</div>
        <button onClick={() => router.push('/login')} className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-orange-200">Đăng nhập lại</button>
        <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline hover:text-brand-orange">Về trang chủ</button>
    </div>
  );

  if (loading && !orderPreview) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!orderData || !orderData.items) return <div className="p-8 text-center text-gray-500">Giỏ hàng trống.</div>;

  return (
   <div className="w-full max-w-[1175px] mx-auto py-6 px-4 font-sans bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <EditInfoModal 
        isOpen={isEditingUser} 
        onClose={() => setIsEditingUser(false)} 
        title="Sửa địa chỉ nhận hàng" 
        data={userInfo}
        onSave={(data) => setUserInfo(data)}
      />

      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-2 text-base mb-6">
         <div className="flex items-center gap-2 text-black/60 cursor-pointer hover:text-brand-orange transition-colors" onClick={() => router.push('/')}>
            <span>Trang chủ</span>
            <img src="/assets-gift-payment/SvgAsset10.svg" alt="arrow" className="transform rotate-90 w-3 h-3" />
         </div>
         <div className="flex items-center gap-2 text-black/60 cursor-pointer hover:text-brand-orange transition-colors" onClick={() => router.push('/cart')}>
            <span>Giỏ hàng</span>
            <img src="/assets-gift-payment/SvgAsset9.svg" alt="arrow" className="transform rotate-90 w-3 h-3" />
         </div>
         <div className="text-black font-normal font-medium">Thanh toán</div>
      </div>

      {/* 2. LAYOUT CHÍNH */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
         
         {/* --- CỘT TRÁI (CONTENT) --- */}
         <div className="flex flex-col w-full lg:flex-1 gap-4">
         
            {/* 2. Địa chỉ nhận hàng */}
            <div
               onClick={goToEditAddress} 
               className="bg-white p-6 rounded-[15px] border border-[#e78720] shadow-[0_4px_20px_rgba(231,135,32,0.08)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md cursor-pointer group"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xl text-black font-bold group-hover:text-brand-orange transition-colors">{userInfo.name}</span>
                        <span className="text-base text-[#414141] font-normal">(Mặc định)</span>
                        <span className="text-[15px] text-[#7a7b7b] font-normal">{userInfo.phone}</span>
                    </div>
                    <span className="text-base text-[#414141] font-normal line-clamp-2">{userInfo.address}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsEditingUser(true); }}
                    className="relative w-8 h-8 flex-shrink-0 self-end sm:self-center cursor-pointer hover:scale-110 transition-transform"
                >
                    <img className="w-full h-full" src="/assets-gift-payment/SvgAsset11.svg" alt="Edit" />
                </button>
            </div>

            {/* 3. Danh sách sản phẩm */}
            <div className="bg-white p-6 rounded-[15px] border border-[#f0f0f0] flex flex-col gap-6">
                {orderPreview?.items?.map((item: any) => (
                    <div key={item.productId} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img src={item.image?.url || '/assets/placeholder.png'} className="w-full h-full object-cover mix-blend-multiply"/>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-1">{item.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                <p>Phân loại: <span className="text-gray-700">Mặc định</span></p>
                                <p>Số lượng: <span className="font-semibold text-gray-900">x{item.quantity}</span></p>
                            </div>
                        </div>
                        <div className="font-bold text-brand-orange text-lg whitespace-nowrap">
                            {item.subtotal.toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. Phương thức vận chuyển */}
            <div className="p-6 bg-white rounded-[15px] border border-gray-100 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-black">Phương thức vận chuyển</h3>
                </div>

                <div className="flex flex-col gap-3">
                    {shippingOptionsData.map((item, index) => (
                        <div 
                            key={index} 
                            onClick={() => setSelectedShipping(index)}
                            className={`
                                p-4 rounded-[15px] border cursor-pointer transition-all flex justify-between items-center group
                                ${selectedShipping === index 
                                    ? 'bg-[#e78720]/10 border-[#e78720]' 
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            <ShippingOption {...item} />
                            {selectedShipping === index ? (
                                <span className="text-brand-orange text-sm font-bold">✓</span>
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-gray-400"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. VOUCHERS & COINS */}
            <VoucherSection 
                onSelectVoucher={goToSelectVoucher}
                selectedVoucherText={voucherId ? "Đã áp dụng mã giảm giá" : "Chọn hoặc nhập mã"}
                discountAmount={orderData.voucherDiscount}
                useCoins={useCoins}
                onToggleCoins={setUseCoins}
                coinBalance={10000}
            />

            {/* 6. Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-[15px] border border-[#f0f0f0] flex flex-col gap-4 shadow-sm">
                <h3 className="text-xl font-bold text-black">Phương thức thanh toán</h3>
                <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map((method) => (
                        <div 
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`
                                border rounded-[15px] p-3 flex items-center gap-4 cursor-pointer transition-all duration-200 relative overflow-hidden
                                ${selectedPayment === method.id 
                                    ? 'border-[#e78720] bg-[#e78720]/5 shadow-inner' 
                                    : 'border-[#eaeaea] hover:bg-gray-50 hover:border-gray-300'
                                }
                            `}
                        >
                            <img src={method.icon} alt={method.name} className="w-[100px] h-[34px] rounded-[4px] object-contain bg-white border border-gray-100" />
                            <span className={`text-[15px] flex-1 ${selectedPayment === method.id ? 'font-bold text-black' : 'font-normal text-black'}`}>
                                {method.name}
                            </span>
                            {selectedPayment === method.id ? (
                                <div className="w-[24px] h-[24px] bg-brand-orange rounded-full flex items-center justify-center shadow-sm z-10">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            ) : (
                                <div className="w-[24px] h-[24px] rounded-full border-2 border-gray-300"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

         </div>

         {/* --- CỘT PHẢI (STICKY SUMMARY) --- */}
         <div className="w-full lg:w-[392px]">
            <OrderSummaryBox 
                subtotal={orderData.subtotal}
                shippingFee={orderData.shippingFee}
                shippingDiscount={orderData.shippingDiscount}
                voucherDiscount={orderData.voucherDiscount}
                coinDiscount={orderData.coinDiscount}
                total={orderData.total}
                onPlaceOrder={handleOrder}
                loading={processing}
                buttonText="Thanh toán ngay"
            />
         </div>
      </div>
   </div>
  );
};

export default PaymentPage;
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

// Stores
import { useCartData, useCartActions } from '@/store/useCartStore'; 
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserStore } from '@/store/useUserStore';

// Services & Types
import { OrderService, CreateOrderPayload, PreviewOrderResponse } from '@/services/order.service';
import { CartItem } from '@/types/cart';
import { AddressService, IAddress } from '@/services/address.service';

// Components
import PaymentSummary from '@/modules/payment/components/PaymentSummary';
import AddressInfo from './components/AddressInfo';
import OrderItem from '@/modules/payment/components/OrderItem';
import VoucherSelectionModal from '@/components/ui/VoucherSelectionModal';
import AddressSelectionModal from './components/AddressSelectionModal'; 
import AddressFormModal from './components/AddressFormModal'; 

// --- ICONS ---
const Icons = {
  Store: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>,
  Ticket: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
  Truck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.126-.504 1.126-1.125V15m0-1.5h-12.75a1.125 1.125 0 00-1.125 1.125v3.75M3.75 8.25h9m-9 3H12m0 0h5.5m-5.5 0h1.5m3 0h1.5m-3 0h-3.75a1.125 1.125 0 00-1.125 1.125V18a1.125 1.125 0 001.125 1.125M17.25 9l2.25 2.25m-2.25-2.25l2.25-2.25M17.25 9h-2.25" /></svg>,
  Message: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  Coin: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v.166a3.836 3.836 0 01-1.72-.756.75.75 0 00-1.06 1.06c.978.978 2.31 1.469 3.53 1.469a3.836 3.836 0 001.72-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a4.53 4.53 0 00-1.719-.756v-.166c.569.11 1.153.37 1.72.756a.75.75 0 001.06-1.06c-.978-.978-2.31-1.469-3.53-1.469a3.836 3.836 0 00-1.72.756V6z" clipRule="evenodd" /></svg>
};

// --- SUB-COMPONENT: Coin Input ---
const CoinInputBlock = ({ 
  userPoints, 
  appliedCoins, 
  onCoinChange,
  orderTotal 
}: { 
  userPoints: number, 
  appliedCoins: number, 
  onCoinChange: (val: number) => void,
  orderTotal: number
}) => {
  const [inputValue, setInputValue] = useState(appliedCoins > 0 ? appliedCoins.toString() : '');
  const [isEnabled, setIsEnabled] = useState(appliedCoins > 0);

  // Sync khi appliedCoins thay đổi từ bên ngoài (hoặc reset)
  useEffect(() => {
    if (appliedCoins === 0 && !isEnabled) {
      setInputValue('');
    }
  }, [appliedCoins, isEnabled]);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (!newState) {
      onCoinChange(0);
      setInputValue('');
    } else {
        // Mặc định focus vào input
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho nhập số
    const valStr = e.target.value.replace(/[^0-9]/g, '');
    let val = parseInt(valStr, 10);

    if (isNaN(val)) val = 0;

    // Logic giới hạn: Không quá số điểm hiện có
    // VÀ không quá tổng tiền đơn hàng (nếu muốn chặn ở UI)
    // Ở đây mình chặn theo userPoints trước
    if (val > userPoints) val = userPoints;
    
    setInputValue(val === 0 ? '' : val.toString());
    onCoinChange(val);
  };

  const handleBlur = () => {
      // Khi blur, nếu input rỗng hoặc 0 thì tắt toggle cho đẹp (tuỳ chọn)
      if (inputValue === '' || inputValue === '0') {
        // setIsEnabled(false);
        // onCoinChange(0);
      }
  };

  const handleUseMax = () => {
      // Logic dùng tối đa: Min(UserPoint, OrderTotal)
      // Giả sử 1 xu = 1đ. Nếu BE config khác thì cần logic khác.
      // Tạm thời set max theo userPoints, BE sẽ cắt bớt nếu thừa.
      let maxVal = userPoints; 
      
      // Nếu muốn UX tốt hơn: không nhập quá số tiền đơn hàng
      // if (maxVal > orderTotal) maxVal = orderTotal; 

      setInputValue(maxVal.toString());
      onCoinChange(maxVal);
      setIsEnabled(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-5">
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Icons.Coin />
                <span className="font-medium text-gray-800">G-Mall Xu</span>
                <span className="text-xs text-gray-500">(Dư: <span className="font-bold text-orange-500">{userPoints.toLocaleString()}</span>)</span>
            </div>
            
            {/* Toggle Switch */}
            <button 
                onClick={handleToggle}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${isEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        {isEnabled && (
            <div className="flex items-center gap-3 animate-fade-in-down">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={handleChangeInput}
                        onBlur={handleBlur}
                        placeholder="Nhập số xu..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-orange-500 outline-none pr-16 font-medium text-gray-700"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">XU</span>
                </div>
                <button 
                    onClick={handleUseMax}
                    className="px-3 py-2 bg-orange-50 text-orange-600 text-xs font-bold rounded border border-orange-100 hover:bg-orange-100 whitespace-nowrap"
                >
                    Dùng tối đa
                </button>
            </div>
        )}
        
        {isEnabled && parseInt(inputValue || '0') > 0 && (
             <p className="text-xs text-green-600 flex items-center gap-1">
                ✅ Sẽ giảm trực tiếp {parseInt(inputValue || '0').toLocaleString()}đ vào đơn hàng.
             </p>
        )}
      </div>
    </div>
  );
};

const PaymentPage = () => {
  const router = useRouter();
  
  // Stores
  const { isAuthenticated, user } = useUserStore(); // [UPDATE] Lấy user để biết user.point
  const { removeMultipleItems } = useCartActions(); 
  const { items: cartItems, selectedIds } = useCartData(); 
  
  const {
    receiverInfo,
    senderInfo,
    shopVouchers,
    shopMessages,
    selectedSystemVoucher,
    appliedCoins, // [UPDATE] Lấy state coins
    setReceiverInfo,
    setShopVoucher,
    setSystemVoucher,
    setShopMessage,
    setAppliedCoins, // [UPDATE] Hàm set coins
    resetCheckout,
    isBuyNowFlow,
    checkoutItems
  } = useCheckoutStore();

  // --- LOCAL STATE ---
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'pay2s' | 'momo'>('cod');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [currentShopIdForVoucher, setCurrentShopIdForVoucher] = useState<string | null>(null);
  
  // ADDRESS STATE
  const [addressList, setAddressList] = useState<IAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewOrderResponse | null>(null);

  const SHIPPING_FEE_PER_SHOP = 30000;

  // --- LOGIC: Select Items Source (Cart vs Buy Now) ---
  const validPaymentItems = useMemo(() => {
    if (isBuyNowFlow && checkoutItems.length > 0) {
       return checkoutItems;
    }
    return cartItems.filter(item => selectedIds.includes(item.id));
  }, [isBuyNowFlow, checkoutItems, cartItems, selectedIds]);


  // --- LOGIC: Fetch Addresses ---
  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
     if(isAddressModalOpen) {
         fetchAddresses();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddressModalOpen]);

  const fetchAddresses = async () => {
    try {
      const res = await AddressService.getAll();
      const addresses = res || [];
      setAddressList(addresses);

      const isStoreEmpty = !receiverInfo.address || !receiverInfo.phone || !receiverInfo.name;
      
      if (isStoreEmpty && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          handleSelectAddress(defaultAddr);
      } 
      else if (!isStoreEmpty && !selectedAddressId && addresses.length > 0) {
          const matchedAddr = addresses.find(a => 
              a.fullAddress === receiverInfo.address && a.phone === receiverInfo.phone
          );
          if (matchedAddr) {
              setSelectedAddressId(matchedAddr.id);
          }
      }
    } catch (error) {
      console.error("Lỗi tải địa chỉ:", error);
      setAddressList([]);
    }
  };

  const handleSelectAddress = (addr: IAddress) => {
      setSelectedAddressId(addr.id);
      setReceiverInfo({
          name: addr.name,
          phone: addr.phone,
          address: addr.fullAddress
      });
      setIsAddressModalOpen(false);
  };

  const handleAddNewAddress = () => {
      setEditingAddress(null);
      setIsAddressModalOpen(false); 
      setIsAddressFormOpen(true);   
  };

  const handleEditAddress = (addr: IAddress) => {
      setEditingAddress(addr);
      setIsAddressModalOpen(false);
      setIsAddressFormOpen(true);
  };

  const handleAddressFormSuccess = async () => {
      setIsAddressFormOpen(false);
      await fetchAddresses(); 
      setIsAddressModalOpen(true); 
  };

  const displayAddress = useMemo(() => {
    if(receiverInfo.name?.trim() && receiverInfo.address?.trim() && receiverInfo.phone?.trim()) {
        return {
            id: selectedAddressId || 'temp',
            name: receiverInfo.name,
            phone: receiverInfo.phone,
            fullAddress: receiverInfo.address,
            isDefault: false
        };
    }
    return null;
  }, [receiverInfo, selectedAddressId]);


  // --- LOGIC 1: GROUP ITEMS BY SHOP ---
  const groupedItems = useMemo(() => {
    const itemsToProcess = validPaymentItems;
    
    const groups: Record<string, { shopName: string; items: CartItem[] }> = {};
    itemsToProcess.forEach(item => {
      const sId = item.shopId || 'unknown';
      if (!groups[sId]) {
        groups[sId] = { shopName: item.shopName || 'Cửa hàng', items: [] };
      }
      groups[sId].items.push(item);
    });
    return groups;
  }, [validPaymentItems]);

  // --- [NEW] FRONTEND CALCULATIONS ---
  const frontendCalculations = useMemo(() => {
      let subtotal = 0;
      let totalShipping = 0;
      let totalShopDiscount = 0;
      
      Object.entries(groupedItems).forEach(([shopId, group]) => {
          const groupSum = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          subtotal += groupSum;
          totalShipping += SHIPPING_FEE_PER_SHOP;

          const v = shopVouchers[shopId];
          if(v?.discountValue) {
              totalShopDiscount += v.discountValue;
          }
      });

      const systemDiscount = previewData?.discountAmount || 0; 
      
      // [UPDATE] Coin Discount Logic
      // Lấy từ previewData (chính xác nhất) hoặc fallback về appliedCoins
      // Giả sử tỷ lệ đổi 1 xu = 1 VNĐ
      const coinDiscount = previewData?.coinDiscount || appliedCoins || 0;

      const finalTotal = subtotal + totalShipping - totalShopDiscount - systemDiscount - coinDiscount;
      
      return {
          subtotal,
          shippingFee: totalShipping,
          shopDiscount: totalShopDiscount,
          systemDiscount,
          coinDiscount, // Trả về để truyền xuống PaymentSummary
          total: finalTotal > 0 ? finalTotal : 0
      };
  }, [groupedItems, shopVouchers, previewData, selectedSystemVoucher, appliedCoins]);


  // --- LOGIC 2: BUILD PAYLOAD ---
  const buildPayload = (isPreview = false): CreateOrderPayload | null => {
    if (validPaymentItems.length === 0) return null;

    const voucherIds: string[] = [];
    if (selectedSystemVoucher?.id) voucherIds.push(selectedSystemVoucher.id);
    Object.values(shopVouchers).forEach(v => v?.id && voucherIds.push(v.id));

    return {
      isBuyNow: isBuyNowFlow,
      items: validPaymentItems.map(i => ({
        productId: String(i.productId),
        variantId: i.productVariantId ? String(i.productVariantId) : undefined,
        quantity: i.quantity
      })),
      voucherIds,
      receiverInfo: {
        name: receiverInfo.name,
        phone: receiverInfo.phone,
        address: receiverInfo.address,
      },
      paymentMethod: selectedPayment,
      note: shopMessages,
      
      // [UPDATE] Truyền thông tin xu lên BE
      useCoins: appliedCoins > 0, 
      appliedCoins: appliedCoins,

      senderInfo: senderInfo.name ? senderInfo : undefined,
    };
  };

  // --- LOGIC 3: PREVIEW ORDER ---
  useEffect(() => {
    const fetchPreview = async () => {
      if (validPaymentItems.length === 0 || !isAuthenticated) return;
      
      const payload = buildPayload(true);
      if (!payload) return;

      try {
        setIsLoading(true);
        const data = await OrderService.previewOrder(payload);
        setPreviewData(data);
      } catch (error) {
        console.error("Preview error", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timer);
  // Thêm appliedCoins vào dependency để khi nhập xu thì gọi lại BE tính tiền
  }, [validPaymentItems, shopVouchers, selectedSystemVoucher, appliedCoins, receiverInfo, isAuthenticated]);

  // --- LOGIC 4: HANDLE CHECKOUT ---
  const handlePlaceOrder = async () => {
    if (!receiverInfo.address?.trim() || !receiverInfo.phone?.trim() || !receiverInfo.name?.trim()) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ nhận hàng!");
      fetchAddresses(); 
      setIsAddressModalOpen(true);
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    try {
      setIsProcessing(true);
      const res = await OrderService.createOrder(payload);
      
      toast.success("Đặt hàng thành công!");

      if (!isBuyNowFlow) {
         await removeMultipleItems(selectedIds);
      }
      
      resetCheckout();

      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        const orderIds = res.orders.map(o => o.id).join(',');
        router.push(`/payment/success?orderIds=${orderIds}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đặt hàng thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenVoucherModal = (shopId: string | 'system') => {
      setCurrentShopIdForVoucher(shopId);
      setShowVoucherModal(true);
  };

  const handleApplyVoucher = (voucher: any) => {
      if (currentShopIdForVoucher === 'system') {
          setSystemVoucher(voucher);
      } else if (currentShopIdForVoucher) {
          setShopVoucher(currentShopIdForVoucher, voucher);
      }
      setShowVoucherModal(false);
      toast.success(`Đã áp dụng mã: ${voucher.code}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto py-8 px-4 bg-[#F8F9FA] min-h-screen font-sans">
       <Toaster position="top-center" />

       <AddressSelectionModal 
           isOpen={isAddressModalOpen}
           onClose={() => setIsAddressModalOpen(false)}
           addresses={addressList}
           selectedId={selectedAddressId}
           onSelect={handleSelectAddress}
           onAddNew={handleAddNewAddress}
           onEdit={handleEditAddress}
       />

       <AddressFormModal 
           isOpen={isAddressFormOpen}
           onClose={() => {
               setIsAddressFormOpen(false);
               setIsAddressModalOpen(true);
           }}
           onSuccess={handleAddressFormSuccess}
           initialData={editingAddress}
       />

       {showVoucherModal && (
          <VoucherSelectionModal
             isOpen={true}
             onClose={() => setShowVoucherModal(false)}
             onSelect={handleApplyVoucher}
             shopId={currentShopIdForVoucher !== 'system' ? currentShopIdForVoucher || undefined : undefined}
             isSystem={currentShopIdForVoucher === 'system'}
             subtotal={frontendCalculations.subtotal}
          />
       )}

       <div className="flex items-center gap-2 text-sm mb-6 text-gray-500 select-none">
         <span className="cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span> / 
         <span className="cursor-pointer" onClick={() => router.push('/cart')}>Giỏ hàng</span> / 
         <span className="text-gray-800 font-medium">Thanh toán</span>
       </div>

       <div className="flex flex-col lg:flex-row gap-6 items-start relative">
         <div className="flex-1 flex flex-col gap-5 w-full min-w-0">
           
           <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#F2542D,#F2542D_30px,#ffffff_30px,#ffffff_60px,#1b64da_60px,#1b64da_90px,#ffffff_90px,#ffffff_120px)] opacity-80"></div>
             <div className="p-5 pt-6">
                <div className="flex items-center gap-2 mb-3 text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <h3 className="font-bold text-base">Địa chỉ nhận hàng</h3>
                </div>
                <AddressInfo 
                    address={displayAddress as any} 
                    onClick={() => setIsAddressModalOpen(true)} 
                />
             </div>
           </div>

           {Object.entries(groupedItems).map(([shopId, group]) => {
              const currentVoucher = shopVouchers[shopId];
              const displayShippingFee = SHIPPING_FEE_PER_SHOP;
              const shopItemTotal = group.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
              const shopDiscountValue = currentVoucher?.discountValue || 0;
              const displayShopTotal = shopItemTotal + displayShippingFee - shopDiscountValue;

              return (
                <div key={shopId} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                   <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                      <Icons.Store />
                      <span className="font-bold text-gray-800">{group.shopName}</span>
                   </div>

                   <div className="px-5 py-2 divide-y divide-gray-50">
                      {group.items.map((item) => (
                         <div key={item.id} className="py-2">
                             <OrderItem 
                                productId={String(item.productId)}
                                name={item.title}
                                imageUrl={item.imageUrl}
                                price={item.price}
                                quantity={item.quantity}
                                color={item.color}
                                size={item.size}
                             />
                         </div>
                      ))}
                   </div>

                   <div className="border-t border-dashed border-gray-200 bg-[#FDFDFD]">
                      <div className="px-5 py-4 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50 cursor-pointer group"
                           onClick={() => handleOpenVoucherModal(shopId)}>
                         <div className="flex items-center gap-3 text-gray-700">
                            <span className="text-orange-500"><Icons.Ticket /></span>
                            <span className="text-sm font-medium">Voucher của Shop</span>
                         </div>
                         <div className="flex items-center gap-2 text-blue-600 text-sm group-hover:text-blue-700">
                            <span>{currentVoucher ? `Đã chọn: -${currentVoucher.discountValue?.toLocaleString()}đ` : 'Chọn voucher'}</span>
                            <Icons.ChevronRight />
                         </div>
                      </div>

                      <div className="px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-gray-50 bg-blue-50/10">
                         <div className="flex items-center gap-3 text-green-700">
                            <Icons.Truck />
                            <span className="text-sm font-medium">Đơn vị vận chuyển</span>
                         </div>
                         <div className="flex flex-col sm:items-end text-sm">
                             <div className="font-bold text-gray-800 flex items-center gap-2">
                                 <span>Giao Hàng Nhanh</span>
                                 <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded border">Tiêu chuẩn</span>
                             </div>
                             <div className="text-orange-600 font-bold text-sm mt-1">
                                 {displayShippingFee.toLocaleString()} đ
                             </div>
                         </div>
                      </div>

                      <div className="px-5 py-4 flex items-center gap-3">
                         <span className="text-gray-400"><Icons.Message /></span>
                         <span className="text-sm text-gray-600 min-w-[60px]">Lời nhắn:</span>
                         <input 
                            type="text" 
                            placeholder="Lưu ý cho người bán..." 
                            onChange={(e) => setShopMessage(shopId, e.target.value)}
                            className="flex-1 text-sm border-b border-gray-200 focus:border-orange-400 outline-none bg-transparent py-1" 
                         />
                      </div>

                      <div className="px-5 py-3 flex justify-end items-center gap-2 border-t border-gray-100 bg-gray-50 text-sm">
                         <span className="text-gray-500">Tổng số tiền ({group.items.length} sản phẩm):</span>
                         <span className="text-lg font-bold text-orange-600">
                             ₫{displayShopTotal.toLocaleString()}
                         </span>
                      </div>
                   </div>
                </div>
              );
           })}

           <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                     onClick={() => handleOpenVoucherModal('system')}>
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                       <Icons.Ticket />
                       <span>G-Mall Voucher</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                       <span>{selectedSystemVoucher ? `Đã chọn: ${selectedSystemVoucher.code}` : 'Chọn hoặc nhập mã'}</span>
                       <Icons.ChevronRight />
                    </div>
                </div>
           </div>
            
           {/* [NEW] Khối nhập xu - Đặt ngay sau Voucher */}
           <CoinInputBlock 
               userPoints={user?.point || 0}
               appliedCoins={appliedCoins}
               onCoinChange={(val) => setAppliedCoins(val)}
               orderTotal={frontendCalculations.subtotal}
           />

           <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
             <h3 className="font-bold text-gray-800 mb-4">Phương thức thanh toán</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {id:'cod', name:'Thanh toán khi nhận hàng'}, 
                  {id:'pay2s', name:'Thanh toán Online (PayOS/VNPAY)'},
                  {id:'momo', name:'Ví MoMo'}
                ].map(method => (
                   <div key={method.id} onClick={() => setSelectedPayment(method.id as any)}
                     className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedPayment === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {selectedPayment === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                     </div>
                     <span className="text-sm font-medium">{method.name}</span>
                   </div>
                ))}
             </div>
           </div>
         </div>

         <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-4 z-10 h-fit">
            <PaymentSummary 
               subtotal={frontendCalculations.subtotal}
               shopDiscount={frontendCalculations.shopDiscount}
               systemDiscount={frontendCalculations.systemDiscount}
               shippingFee={frontendCalculations.shippingFee}
               shippingDiscount={0} 
               coinDiscount={frontendCalculations.coinDiscount} // [UPDATE] Truyền giá trị xu
               total={frontendCalculations.total}
               onPlaceOrder={handlePlaceOrder}
               loading={isLoading || isProcessing}
            />
         </div>
       </div>
    </div>
  );
};

export default PaymentPage;
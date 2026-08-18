// src/modules/gift-payment/GiftPaymentPage.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/ApiClient';
import { OrderService, CreateOrderPayload } from '@/services/order.service';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserStore } from '@/store/useUserStore';
import { useCartData, useCartActions } from '@/store/useCartStore';

import OrderSummaryBox from '@/components/common/OrderSummaryBox';
import { giftWrapData } from './data';
import GiftWrapCard from './components/GiftWrapCard';
import { MapPinIcon, GiftIcon, CreditCardIcon, MailIcon, CheckIcon } from 'lucide-react';
// SỬA LỖI ĐƯỜNG DẪN: Trỏ đúng về thư mục payment
import AddressFormModal from '../payment/components/AddressFormModal'; 
import AddressSelectionModal from '../payment/components/AddressSelectionModal';

// --- CONSTANTS ---
// wiki 0108: chỉ còn COD, đồng bộ với `/payment`.
//
// Trước đây trang này vẫn mời "Chuyển khoản ngân hàng" và "Thanh toán qua PayPal" như
// bình thường — không mờ, không ghi "đang bảo trì" — nhưng cả hai đều bị BE chặn
// (`@IsIn(['cod'])` trong `create-order.dto`, xem wiki 0093). Người dùng chọn xong, điền
// hết thông tin, bấm đặt hàng rồi mới bị từ chối. `/payment` đã bỏ hẳn hai lựa chọn đó;
// hai trang cùng một luồng mua mà nói hai điều khác nhau.
//
// Khi nào bật lại cổng thanh toán thì mở whitelist trong `create-order.dto.ts` TRƯỚC,
// rồi mới thêm lại vào đây — đừng làm ngược.
const PAYMENT_METHODS = [
    { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '/assets-gift-payment/ImageAsset8.png' },
];

const CARD_OPTIONS = [
    { id: 0, name: 'Không thiệp', price: 0, preview: '/assets/no-card.jpg' },
    { id: 1, name: 'Thiệp Tiêu chuẩn', price: 5000, preview: '/assets/card-standard.jpg' },
    { id: 2, name: 'Thiệp Cao cấp', price: 15000, preview: '/assets/card-premium.jpg' },
];

// --- ICONS (Đồng nhất với PaymentPage) ---
const Icons = {
    Ticket: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
    Coin: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v.166a3.836 3.836 0 01-1.72-.756.75.75 0 00-1.06 1.06c.978.978 2.31 1.469 3.53 1.469a3.836 3.836 0 001.72-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a4.53 4.53 0 00-1.719-.756v-.166c.569.11 1.153.37 1.72.756a.75.75 0 001.06-1.06c-.978-.978-2.31-1.469-3.53-1.469a3.836 3.836 0 00-1.72.756V6z" clipRule="evenodd" /></svg>
};

// --- SUB-COMPONENT: Coin Input ---
const CoinInputBlock = ({ userPoints, appliedCoins, onCoinChange, orderTotal }: any) => {
    const [inputValue, setInputValue] = useState(appliedCoins > 0 ? appliedCoins.toString() : '');
    const [isEnabled, setIsEnabled] = useState(appliedCoins > 0);

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
        }
    };

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value.replace(/[^0-9]/g, '');
        let val = parseInt(valStr, 10);
        if (isNaN(val)) val = 0;
        if (val > userPoints) val = userPoints;
        setInputValue(val === 0 ? '' : val.toString());
        onCoinChange(val);
    };

    const handleUseMax = () => {
        let maxVal = userPoints;
        setInputValue(maxVal.toString());
        onCoinChange(maxVal);
        setIsEnabled(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="px-5 py-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Icons.Coin />
                        <span className="font-medium text-gray-800">G-Mall Xu</span>
                        <span className="text-xs text-gray-500">(Dư: <span className="font-bold text-orange-500">{userPoints.toLocaleString()}</span>)</span>
                    </div>
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

const GiftPaymentPage: React.FC = () => {
    const [isMounted, setIsMounted] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const { items: cartItems, selectedIds } = useCartData();
    const { removeMultipleItems } = useCartActions();
    
    // Khai báo Stores
    const { isAuthenticated, _hasHydrated, user } = useUserStore();
    const {
        isBuyNowFlow,
        checkoutItems,
        senderInfo, setSenderInfo,
        receiverInfo, setReceiverInfo,
        selectedVoucherId,
        setSelectedVoucher,
        shopMessages, setShopMessage, 
        shopVouchers,
        appliedCoins, setAppliedCoins,
        cardIndex, setCardIndex // Lấy thêm cardIndex
    } = useCheckoutStore();

    useEffect(() => {
        if (_hasHydrated) {
            if (!isAuthenticated) {
                const next = encodeURIComponent(window.location.pathname + window.location.search);
                router.replace(`/login?next=${next}`);
            } else {
                // [FIX] Cài Dummy Cookie để Middleware (proxy.tsx) nhận diện đã đăng nhập
                // Giúp bypass lỗi văng về /login khi chuyển sang các route /checkout/*
                if (!document.cookie.includes('accessToken=')) {
                    document.cookie = 'accessToken=client_auth_bypass; path=/; max-age=86400; SameSite=Lax';
                }
            }
        }
    }, [_hasHydrated, isAuthenticated, router]);

    const dataParam = searchParams.get('data');
    const updatedVoucher = searchParams.get('updated_voucher');

    const [orderData, setOrderData] = useState<any>({
        items: [], subtotal: 0, shippingFee: 0, shippingDiscount: 0,
        voucherDiscount: 0, coinDiscount: 0, giftWrapFee: 0, total: 0
    });

    const [voucherId, setVoucherId] = useState<string | undefined>(
        selectedVoucherId || (updatedVoucher ? 'DEMO_COMPLEX' : undefined)
    );
    const [loading, setLoading] = useState(true);

    const [selectedGiftWrap, setSelectedGiftWrap] = useState<number | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string>('cod');

    const SHIPPING_FEE_PER_SHOP = 30000;

    useEffect(() => {
        if (selectedVoucherId) setVoucherId(selectedVoucherId);
    }, [selectedVoucherId]);

    useEffect(() => { setIsMounted(true); }, []);

    // 1. DATA SẢN PHẨM
    const parsedDataItems = useMemo(() => {
        if (!dataParam) return null;
        try { return JSON.parse(atob(dataParam)); }
        catch (e) { return null; }
    }, [dataParam]);

    const isActuallyBuyNow = isBuyNowFlow || !!parsedDataItems;

    const validPaymentItems = useMemo(() => {
        if (parsedDataItems && parsedDataItems.length > 0) return parsedDataItems;
        if (isBuyNowFlow && checkoutItems && checkoutItems.length > 0) return checkoutItems;
        return cartItems.filter(item => selectedIds.includes(item.id));
    }, [parsedDataItems, isBuyNowFlow, checkoutItems, cartItems, selectedIds]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, { shopName: string, items: any[] }> = {};
        validPaymentItems.forEach((item: any) => {
            const sId = item.shopId || 'unknown';
            if (!groups[sId]) {
                groups[sId] = { shopName: item.shopName || 'Shop', items: [] };
            }
            groups[sId].items.push(item);
        });
        return Object.entries(groups).map(([shopId, data]) => ({ shopId, ...data }));
    }, [validPaymentItems]);

    const computeShopVoucherVnd = (v: any, shopSubtotal: number): number => {
        if (!v) return 0;
        const raw = v.amount ?? v.discountValue ?? 0;
        if (v.type === 'PERCENTAGE') {
            let d = Math.floor((shopSubtotal * raw) / 100);
            const cap = v.maxDiscount;
            if (cap != null && cap > 0) d = Math.min(d, cap);
            return d;
        }
        return raw;
    };

    const frontendCalculations = useMemo(() => {
        const s = orderData?.summary;
        let subtotal = 0; let totalShipping = 0; let localShopDiscount = 0;

        groupedItems.forEach((group) => {
            // wiki 0108: thiếu price thì coi như 0 thay vì để NaN lan ra toàn bộ tổng tiền.
            const groupSum = group.items.reduce((sum, item) => sum + (Number(item.price ?? 0) * Number(item.quantity ?? 0)), 0);
            subtotal += groupSum;
            totalShipping += SHIPPING_FEE_PER_SHOP;
            localShopDiscount += computeShopVoucherVnd(shopVouchers[group.shopId], groupSum);
        });

        const currentGiftWrapFee = selectedGiftWrap !== null ? giftWrapData[selectedGiftWrap].price : 0;
        const currentCardFee = CARD_OPTIONS.find(c => c.id === cardIndex)?.price || 0;
        const combinedGiftFee = currentGiftWrapFee + currentCardFee;

        if (s) {
            const freeship = s.discounts?.freeship || 0;
            return {
                subtotal: s.subtotal ?? subtotal,
                shippingFee: Math.max(0, (s.shippingFee ?? totalShipping) - freeship),
                shopDiscount: s.discounts?.shopVoucher || 0,
                systemDiscount: s.discounts?.systemVoucher || 0,
                coinDiscount: s.discounts?.coin || 0, 
                giftWrapFee: s.giftFee ?? combinedGiftFee, // Gộp cả phí thiệp + gói quà nếu BE trả về chung 1 field
                total: Math.max(0, s.total ?? 0),
            };
        }

        const fallbackTotal = subtotal + totalShipping + combinedGiftFee - localShopDiscount - appliedCoins;
        return {
            subtotal,
            shippingFee: totalShipping,
            shopDiscount: localShopDiscount,
            systemDiscount: 0,
            coinDiscount: appliedCoins || 0, 
            giftWrapFee: combinedGiftFee,
            total: fallbackTotal > 0 ? fallbackTotal : 0
        };
    }, [groupedItems, shopVouchers, orderData, selectedGiftWrap, appliedCoins, cardIndex]); // Thêm cardIndex vào dependencies

    // --- LOGIC 2: ĐỊA CHỈ & MODAL ---
    const [addressList, setAddressList] = useState<any[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
    const [editingType, setEditingType] = useState<'sender' | 'receiver'>('receiver');

    useEffect(() => {
        fetchAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const fetchAddresses = async () => {
        try {
            const res = await apiClient.get('/addresses');
            const addresses: any[] = res || [];
            setAddressList(addresses);

            const isSenderEmpty = !senderInfo.address || !senderInfo.phone || !senderInfo.name;
            if (isSenderEmpty && addresses.length > 0) {
                const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                setSenderInfo({
                    name: defaultAddr.name,
                    phone: defaultAddr.phone,
                    address: defaultAddr.fullAddress,
                    provinceId: defaultAddr.provinceId,
                    districtId: defaultAddr.districtId,
                    wardCode: defaultAddr.wardCode,
                });
            } 
            
            const isReceiverEmpty = !receiverInfo.address || !receiverInfo.phone || !receiverInfo.name;
            if (!isReceiverEmpty && !selectedAddressId && addresses.length > 0) {
                const matchedAddr = addresses.find(a => 
                    a.fullAddress === receiverInfo.address && a.phone === receiverInfo.phone
                );
                if (matchedAddr) setSelectedAddressId(matchedAddr.id);
            }
        } catch (error) {
            console.error("Lỗi tải địa chỉ:", error);
        }
    };

    const handleEditInfo = (type: 'sender' | 'receiver') => {
        setEditingType(type);
        fetchAddresses();
        setIsAddressModalOpen(true);
    };

    const handleSelectAddress = (addr: any) => {
        if (editingType === 'receiver') {
            setSelectedAddressId(addr.id);
            setReceiverInfo({
                name: addr.name,
                phone: addr.phone,
                address: addr.fullAddress,
                provinceId: addr.provinceId,
                districtId: addr.districtId,
                wardCode: addr.wardCode,
            });
        } else {
            setSenderInfo({
                name: addr.name,
                phone: addr.phone,
                address: addr.fullAddress,
                provinceId: addr.provinceId,
                districtId: addr.districtId,
                wardCode: addr.wardCode,
            });
        }
        setIsAddressModalOpen(false);
    };

    const handleAddNewAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(false); 
        setIsAddressFormOpen(true);  
    };

    const handleEditAddress = (addr: any) => {
        setEditingAddress(addr);
        setIsAddressModalOpen(false);
        setIsAddressFormOpen(true);
    };

    const handleAddressFormSuccess = async () => {
        setIsAddressFormOpen(false);
        await fetchAddresses(); 
        setIsAddressModalOpen(true); 
    };

    // --- LOGIC: BUILD PAYLOAD ---
    const buildPayload = useCallback((isPreview = false) => {
        if (validPaymentItems.length === 0) return null;

        const voucherIds: string[] = [];
        if (voucherId) voucherIds.push(voucherId);
        Object.values(shopVouchers).forEach((v: any) => v?.id && voucherIds.push(v.id));

        const giftNote = selectedGiftWrap !== null 
            ? `[QUÀ TẶNG - Gói số ${selectedGiftWrap}] ` 
            : `[QUÀ TẶNG] `;

        return {
            isBuyNow: isActuallyBuyNow,
            items: validPaymentItems.map((i: any) => ({
                productId: String(i.productId),
                variantId: (i.productVariantId || i.variantId) ? String(i.productVariantId || i.variantId) : undefined,
                quantity: i.quantity
            })),
            voucherIds,
            receiverInfo: {
                name: receiverInfo.name,
                phone: receiverInfo.phone,
                address: receiverInfo.address,
                provinceId: receiverInfo.provinceId,
                districtId: receiverInfo.districtId,
                wardCode: receiverInfo.wardCode,
            },
            senderInfo: {
                name: senderInfo.name,
                message: giftNote + (senderInfo.message || '')
            },
            paymentMethod: selectedPayment,
            note: shopMessages,
            useCoins: appliedCoins > 0,
            appliedCoins: appliedCoins,
            isGift: true,
            giftWrapIndex: selectedGiftWrap,
            cardIndex: cardIndex // Đẩy cardIndex vào Payload
        } as any;
    }, [
        validPaymentItems, isActuallyBuyNow, voucherId, shopVouchers, 
        receiverInfo, senderInfo, selectedPayment, shopMessages, 
        appliedCoins, selectedGiftWrap, cardIndex
    ]); // Thêm cardIndex vào dependencies

    // --- API PREVIEW TÍNH TIỀN ---
    useEffect(() => {
        if (!isMounted) return;
        const fetchPreview = async () => {
            if (validPaymentItems.length === 0) {
                setLoading(false); 
                return;
            }

            const payload = buildPayload(true);
            if (!payload) return;

            try {
                const res = await OrderService.previewOrder(payload);
                if (res) setOrderData(res);
            } catch (error) {
                console.error("Preview error", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPreview, 500);
        return () => clearTimeout(timeoutId);
    }, [isMounted, validPaymentItems, buildPayload]);

    const handleSelectVoucher = () => {
        // [FIX] Gom toàn bộ path hiện tại và encode lại thành 1 chuỗi an toàn
        const currentPath = `/gift-payment${dataParam ? `?data=${encodeURIComponent(dataParam)}` : ''}`;
        const encodedBackUrl = encodeURIComponent(currentPath);
        
        router.push(`/checkout/vouchers?backUrl=${encodedBackUrl}&selected=${voucherId || ''}`);
    };

    // --- XỬ LÝ ĐẶT HÀNG ---
    const handleOrder = async () => {
        if (!senderInfo.name || !senderInfo.phone || !senderInfo.address) return toast.error("Vui lòng điền thông tin người tặng");
        if (!receiverInfo.name || !receiverInfo.phone || !receiverInfo.address) return toast.error("Vui lòng điền thông tin người nhận");
        if (selectedPayment !== 'cod') return toast.error("Vui lòng chọn thanh toán COD (Đang bảo trì Online).");

        const payload = buildPayload(false);
        if (!payload) return;

        try {
            setLoading(true);
            toast.loading("Đang tạo đơn hàng quà tặng...");

            const res = await OrderService.createOrder(payload);

            if (!isActuallyBuyNow) {
                await removeMultipleItems(selectedIds);
            }

            toast.dismiss();
            toast.success("Đặt hàng quà tặng thành công!");

            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                const orderIds = res.orders.map((o: any) => o.id).join(',');
                router.push(`/payment/success?orderIds=${orderIds}`);
            }
            
        } catch (err: any) {
            toast.dismiss();
            const raw = err?.response?.data?.message;
            const msg = Array.isArray(raw) ? raw.join('\n') : (raw || err?.message || 'Có lỗi xảy ra khi tạo đơn.');
            toast.error(msg);
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

    if (validPaymentItems.length === 0) {
        return <div className="p-8 text-center text-gray-500">Giỏ hàng trống. <span className="text-brand-orange cursor-pointer" onClick={() => router.push('/')}>Về trang chủ</span></div>;
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto py-8 px-4 font-sans bg-gray-50 min-h-screen">
            <Toaster position="top-right" />

            <AddressSelectionModal 
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                addresses={addressList}
                selectedId={editingType === 'receiver' ? selectedAddressId : addressList.find(a => a.fullAddress === senderInfo.address && a.phone === senderInfo.phone)?.id}
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

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="cursor-pointer hover:text-brand-orange" onClick={() => router.push('/')}>Trang chủ</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-brand-orange" onClick={() => router.push('/cart')}>Giỏ hàng</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">Thanh toán quà tặng</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* --- CỘT TRÁI --- */}
                <div className="flex flex-col w-full lg:flex-1 gap-6">

                    {/* 1. ĐỊA CHỈ NGƯỜI TẶNG & NGƯỜI NHẬN */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-brand-orange/10 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                            <MapPinIcon className="text-brand-orange" size={20} />
                            <h3 className="font-bold text-gray-800 text-lg">Địa chỉ Giao - Nhận Quà</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-100">
                            <div onClick={() => handleEditInfo('sender')} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">1. Người gửi (Bạn)</span>
                                    <span className="text-brand-orange text-sm opacity-0 group-hover:opacity-100 transition-opacity">Thay đổi</span>
                                </div>
                                {senderInfo.name ? (
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{senderInfo.name} <span className="text-sm font-normal text-gray-500">| {senderInfo.phone}</span></p>
                                        <p className="text-gray-600 mt-2 text-sm">{senderInfo.address}</p>
                                    </div>
                                ) : (
                                    <p className="text-orange-600 text-sm italic">Vui lòng thiết lập thông tin người gửi</p>
                                )}
                            </div>

                            <div onClick={() => handleEditInfo('receiver')} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold text-brand-orange uppercase tracking-wide">2. Người nhận quà</span>
                                    <span className="text-brand-orange text-sm opacity-0 group-hover:opacity-100 transition-opacity">Thay đổi</span>
                                </div>
                                {receiverInfo.name ? (
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{receiverInfo.name} <span className="text-sm font-normal text-gray-500">| {receiverInfo.phone}</span></p>
                                        <p className="text-gray-600 mt-2 text-sm">{receiverInfo.address}</p>
                                        {receiverInfo.message && <p className="mt-3 text-sm italic text-gray-500 bg-gray-100 p-2 rounded">"{receiverInfo.message}"</p>}
                                    </div>
                                ) : (
                                    <p className="text-orange-600 text-sm italic">Vui lòng thiết lập thông tin người nhận</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. SẢN PHẨM GROUP THEO SHOP */}
                    <div className="flex flex-col gap-4">
                        {groupedItems.map((group) => (
                            <div key={group.shopId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                                    <span className="bg-brand-orange text-white text-[10px] px-2 py-0.5 rounded font-bold">Mall</span>
                                    <h3 className="font-bold text-gray-800">{group.shopName}</h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {group.items.map((item: any, index: number) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.imageUrl || item.image || '/assets/placeholder.png'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{item.title || item.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{item.variantName || 'Mặc định'}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    {/* wiki 0108: `?? 0` là lưới an toàn. Một `item` thiếu `price`
                                                        (link `?data=` cũ/hỏng/người dùng sửa tay) từng làm
                                                        `undefined.toLocaleString()` ném lỗi và tháo cả cây React
                                                        → trang trắng tinh, không một chữ nào giải thích. */}
                                                    <span className="text-brand-orange font-bold text-sm">{Number(item.price ?? 0).toLocaleString('vi-VN')} đ</span>
                                                    <span className="text-sm text-gray-600">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Lời nhắn:</span>
                                    <input
                                        type="text"
                                        // wiki 0108: `Order.message` là VARCHAR(191). Không chặn ở đây thì
                                        // người dùng gõ dài rồi mới ăn lỗi lúc bấm đặt hàng (trước đây còn
                                        // là 500 chứ không phải thông báo tử tế).
                                        maxLength={191}
                                        placeholder="Lưu ý cho cửa hàng (Ví dụ: Giao giờ hành chính)"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange"
                                        value={shopMessages[group.shopId] || ''}
                                        onChange={(e) => setShopMessage(group.shopId, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. DỊCH VỤ GÓI QUÀ */}
                    <div className="bg-white rounded-xl shadow-sm border border-brand-orange/50 overflow-hidden">
                        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                            <GiftIcon className="text-brand-orange" size={20} />
                            <h3 className="font-bold text-orange-800 text-lg">Dịch vụ Gói Quà</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {giftWrapData.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedGiftWrap(selectedGiftWrap === index ? null : index)}
                                        className={`
                                    cursor-pointer rounded-[20px] p-[2px] transition-all duration-200 flex-shrink-0
                                    ${selectedGiftWrap === index ? 'ring-2 ring-brand-orange scale-105 shadow-md' : 'hover:opacity-80 opacity-70'}
                                `}
                                    >
                                        <GiftWrapCard {...item} selected={selectedGiftWrap === index} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. MẪU THIỆP CHÚC MỪNG */}
                    <div className="bg-white rounded-xl shadow-sm border border-brand-orange/50 overflow-hidden">
                        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                            <MailIcon className="text-brand-orange" size={20} />
                            <h3 className="font-bold text-orange-800 text-lg">Mẫu thiệp chúc mừng</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {CARD_OPTIONS.map((card) => {
                                const isSelected = cardIndex === card.id;

                                return (
                                    <div
                                        key={card.id}
                                        onClick={() => setCardIndex(card.id)}
                                        className={`relative cursor-pointer rounded-xl border p-3 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-brand-orange bg-orange-50/50 shadow-md ring-1 ring-brand-orange'
                                                : 'border-gray-200 hover:border-brand-orange/50 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                                            {/* Chỗ này có thể để thẻ <img src={card.preview} /> sau nếu có hình thật */}
                                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400 font-medium bg-gray-200">
                                                {card.id === 0 ? 'Không kèm thiệp' : 'Hình ảnh thiệp'}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {card.name}
                                            </p>
                                            <p className="text-brand-orange text-xs font-bold mt-1">
                                                {card.price === 0 ? 'Miễn phí' : `+${card.price.toLocaleString('vi-VN')} ₫`}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-brand-orange text-white rounded-full p-1 shadow-sm">
                                                <CheckIcon className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 5. VOUCHER & XU */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                                 onClick={handleSelectVoucher}>
                                <div className="flex items-center gap-2 text-red-600 font-medium">
                                   <Icons.Ticket />
                                   <span>G-Mall Voucher</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-600 text-sm">
                                   <span>{voucherId ? `Đã áp dụng mã giảm giá` : 'Chọn hoặc nhập mã'}</span>
                                   <Icons.ChevronRight />
                                </div>
                            </div>
                        </div>

                        <CoinInputBlock
                            userPoints={user?.point || 0}
                            appliedCoins={appliedCoins}
                            onCoinChange={(val: number) => setAppliedCoins(val)}
                            orderTotal={frontendCalculations.subtotal}
                        />
                    </div>

                    {/* 6. PHƯƠNG THỨC THANH TOÁN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCardIcon className="text-brand-orange" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Phương thức thanh toán</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {PAYMENT_METHODS.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`
                                border rounded-lg p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center relative
                                ${selectedPayment === method.id
                                            ? 'border-brand-orange bg-orange-50/50 shadow-sm'
                                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                        }
                            `}
                                >
                                    <img src={method.icon} alt={method.name} className="h-8 object-contain mix-blend-multiply" />
                                    <span className={`text-sm ${selectedPayment === method.id ? 'font-semibold text-brand-orange' : 'text-gray-600'}`}>
                                        {method.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* --- CỘT PHẢI (STICKY SUMMARY) --- */}
                <div className="w-full lg:w-[380px] sticky top-[100px]">
                    <OrderSummaryBox
                        subtotal={frontendCalculations.subtotal}
                        shippingFee={frontendCalculations.shippingFee}
                        shippingDiscount={0}
                        voucherDiscount={frontendCalculations.systemDiscount + frontendCalculations.shopDiscount}
                        coinDiscount={frontendCalculations.coinDiscount}
                        giftWrapFee={frontendCalculations.giftWrapFee} 
                        total={frontendCalculations.total}
                        onPlaceOrder={handleOrder}
                        buttonText="Thanh toán & Gửi quà"
                        loading={false}
                    />
                </div>
            </div>
        </div>
    );
}

export default GiftPaymentPage;
// src/modules/payment/GiftPaymentPage.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/ApiClient';

import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserStore } from '@/store/useUserStore';
import { useCartData, useCartActions } from '@/store/useCartStore';

import { encodeData, decodeData } from '@/lib/url-helper';
import OrderSummaryBox from '@/components/common/OrderSummaryBox';
import { giftWrapData } from './data';
import GiftWrapCard from './components/GiftWrapCard';
import VoucherSection from '@/modules/payment/components/VoucherSection';
import { MapPinIcon, GiftIcon, CreditCardIcon } from 'lucide-react';

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

    const { items: cartItems, selectedIds } = useCartData();
    const { removeMultipleItems } = useCartActions();
    const {
        isBuyNowFlow,
        checkoutItems,
        senderInfo, setSenderInfo,
        receiverInfo, setReceiverInfo,
        selectedVoucherId,
        setSelectedVoucher,
        shopMessages, setShopMessage, // Lấy state lời nhắn cho từng shop
        shopVouchers // Lấy state voucher của shop để tính toán
    } = useCheckoutStore();

    const { isAuthenticated, _hasHydrated } = useUserStore();

    useEffect(() => {
        // Chỉ kiểm tra khi chắc chắn đã load xong state từ localStorage
        if (_hasHydrated) {
            if (!isAuthenticated) {
                const next = encodeURIComponent(window.location.pathname + window.location.search);
                router.replace(`/login?next=${next}`);
            }
        }
    }, [_hasHydrated, isAuthenticated, router]);

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
    const [loading, setLoading] = useState(true);

    // States Gói quà & Thanh toán
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

    // Nhóm sản phẩm theo Shop (Chuẩn UI Đặt hàng)
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

    // [FIX] Hàm quy đổi voucher shop ra VND THỰC
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

    // [FIX] Dựng frontendCalculations tương tự PaymentPage
    const frontendCalculations = useMemo(() => {
        const s = orderData?.summary;

        let subtotal = 0;
        let totalShipping = 0;
        let localShopDiscount = 0;

        groupedItems.forEach((group) => {
            const groupSum = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            subtotal += groupSum;
            totalShipping += SHIPPING_FEE_PER_SHOP;
            localShopDiscount += computeShopVoucherVnd(shopVouchers[group.shopId], groupSum);
        });

        // Tính toán phí gói quà tạm thời
        const currentGiftWrapFee = selectedGiftWrap !== null ? giftWrapData[selectedGiftWrap].price : 0;

        if (s) {
            const shopDiscount = s.discounts?.shopVoucher || 0;
            const systemDiscount = s.discounts?.systemVoucher || 0;
            const freeship = s.discounts?.freeship || 0;
            const coinDiscount = s.discounts?.coin || 0;
            return {
                subtotal: s.subtotal ?? subtotal,
                shippingFee: Math.max(0, (s.shippingFee ?? totalShipping) - freeship),
                shopDiscount,
                systemDiscount,
                coinDiscount,
                giftWrapFee: s.giftFee ?? currentGiftWrapFee,
                total: Math.max(0, s.total ?? 0),
            };
        }

        const fallbackTotal = subtotal + totalShipping + currentGiftWrapFee - localShopDiscount;
        return {
            subtotal,
            shippingFee: totalShipping,
            shopDiscount: localShopDiscount,
            systemDiscount: 0,
            coinDiscount: 0, // Gift payment tạm chưa tích hợp coin (có thể thêm nếu BE support)
            giftWrapFee: currentGiftWrapFee,
            total: fallbackTotal > 0 ? fallbackTotal : 0
        };
    }, [groupedItems, shopVouchers, orderData, selectedGiftWrap]);

    // --- EFFECT 1: URL PARAMS ---
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
            setSelectedVoucher(currentParams.get('updated_voucher') || '');
            currentParams.delete('updated_voucher');
            hasChanges = true;
        }

        if (hasChanges) {
            router.replace(`?${currentParams.toString()}`, { scroll: false });
        }
    }, [isMounted, searchParams]);

    // --- EFFECT 2: API TÍNH TIỀN ---
    useEffect(() => {
        if (!isMounted) return;
        const fetchPreview = async () => {
            if (validPaymentItems.length === 0) {
                setLoading(false); return;
            }
            try {
                const orderItems = validPaymentItems.map((item: any) => ({
                    productId: String(item.productId),
                    variantId: (item.productVariantId || item.variantId) ? String(item.productVariantId || item.variantId) : undefined,
                    quantity: item.quantity
                }));

                const res = await apiClient.post('/orders/preview', {
                    isBuyNow: isActuallyBuyNow,
                    items: orderItems,
                    voucherId: voucherId,
                    useCoins: useCoins,
                    isGift: selectedGiftWrap !== null
                });

                if (res) setOrderData(res);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchPreview, 300);
        return () => clearTimeout(timeoutId);
    }, [isMounted, validPaymentItems, isActuallyBuyNow, voucherId, useCoins, selectedGiftWrap]);

    // --- HANDLERS ---
    const handleEditInfo = (type: 'sender' | 'receiver') => {
        const infoData = type === 'sender' ? senderInfo : receiverInfo;
        const dataQuery = dataParam ? `&data=${encodeURIComponent(dataParam)}` : '';
        router.push(`/checkout/edit-address?type=${type}&backUrl=/gift-payment${dataQuery}&info=${encodeData(infoData)}`);
    };

    const handleSelectVoucher = () => {
        const dataQuery = dataParam ? `&data=${encodeURIComponent(dataParam)}` : '';
        router.push(`/checkout/vouchers?backUrl=/gift-payment${dataQuery}&selected=${voucherId || ''}`);
    };

    const handleOrder = async () => {
        if (!senderInfo.name || !senderInfo.phone || !senderInfo.address) return toast.error("Vui lòng điền thông tin người tặng");
        if (!receiverInfo.name || !receiverInfo.phone || !receiverInfo.address) return toast.error("Vui lòng điền thông tin người nhận");
        if (selectedPayment !== 'cod') return toast.error("Vui lòng chọn thanh toán COD (Đang bảo trì Online).");

        try {
            setLoading(true);
            toast.loading("Đang tạo đơn hàng quà tặng...");

            const orderItems = validPaymentItems.map((item: any) => ({
                productId: String(item.productId),
                variantId: (item.productVariantId || item.variantId) ? String(item.productVariantId || item.variantId) : undefined,
                quantity: item.quantity
            }));

            await apiClient.post('/orders', {
                isGift: true,
                isBuyNow: isActuallyBuyNow,
                senderInfo,
                receiverInfo,
                items: orderItems,
                paymentMethod: selectedPayment,
                voucherId: voucherId,
                useCoins: useCoins,
                giftWrapIndex: selectedGiftWrap,
                note: shopMessages, // Gửi lời nhắn cho từng shop
                totalAmount: frontendCalculations.total // [FIX] Sử dụng total đã tính toán
            });

            if (!isActuallyBuyNow) await removeMultipleItems(selectedIds);

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

    if (validPaymentItems.length === 0) {
        return <div className="p-8 text-center text-gray-500">Giỏ hàng trống. <span className="text-brand-orange cursor-pointer" onClick={() => router.push('/')}>Về trang chủ</span></div>;
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto py-8 px-4 font-sans bg-gray-50 min-h-screen">
            <Toaster position="top-right" />

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="cursor-pointer hover:text-brand-orange" onClick={() => router.push('/')}>Trang chủ</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-brand-orange" onClick={() => router.push('/cart')}>Giỏ hàng</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">Thanh toán quà tặng</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* --- CỘT TRÁI (THÔNG TIN) --- */}
                <div className="flex flex-col w-full lg:flex-1 gap-6">

                    {/* 1. ĐỊA CHỈ NGƯỜI TẶNG & NGƯỜI NHẬN */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-brand-orange/10 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                            <MapPinIcon className="text-brand-orange" size={20} />
                            <h3 className="font-bold text-gray-800 text-lg">Địa chỉ Giao - Nhận Quà</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-100">
                            {/* Người tặng */}
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

                            {/* Người nhận */}
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

                    {/* 2. SẢN PHẨM GROUP THEO SHOP (CHUẨN UI MALL) */}
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
                                                    <span className="text-brand-orange font-bold text-sm">{(item.price).toLocaleString('vi-VN')} đ</span>
                                                    <span className="text-sm text-gray-600">x{item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Lời nhắn cho Shop */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Lời nhắn:</span>
                                    <input
                                        type="text"
                                        placeholder="Lưu ý cho cửa hàng (Ví dụ: Giao giờ hành chính)"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange"
                                        value={shopMessages[group.shopId] || ''}
                                        onChange={(e) => setShopMessage(group.shopId, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. MODULE RIÊNG: CHỌN GÓI QUÀ */}
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
                                        <GiftWrapCard {...item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. VOUCHER & XU */}
                    <VoucherSection
                        onSelectVoucher={handleSelectVoucher}
                        selectedVoucherText={voucherId ? "Đã áp dụng mã giảm giá" : "Chọn hoặc nhập mã"}
                        discountAmount={frontendCalculations.systemDiscount + frontendCalculations.shopDiscount}
                        useCoins={useCoins}
                        onToggleCoins={setUseCoins}
                        coinBalance={10000}
                    />

                    {/* 5. PHƯƠNG THỨC THANH TOÁN */}
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
                        // [FIX] Truyền các số liệu từ frontendCalculations
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
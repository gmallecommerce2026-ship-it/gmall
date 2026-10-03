"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/ApiClient';
import { OrderService, CreateOrderPayload } from '@/services/order.service';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserStore } from '@/store/useUserStore';
import { useCartData, useCartActions } from '@/store/useCartStore';
import { VoucherService, Voucher } from '@/services/voucher.service';

// Components đồng bộ từ Payment
import OrderItem from '@/modules/payment/components/OrderItem';
import AddressFormModal from '@/modules/payment/components/AddressFormModal';
import AddressSelectionModal from '@/modules/payment/components/AddressSelectionModal';
import OrderSummaryBox from '@/components/common/OrderSummaryBox';

// Components riêng cho Quà Tặng
import { giftWrapData } from './data';
import GiftWrapCard from './components/GiftWrapCard';
import { GiftIcon, MailIcon, CheckIcon, X as XIcon } from 'lucide-react';

// --- CONSTANTS ---
const PAYMENT_METHODS = [
    { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)' },
];

const CARD_OPTIONS = [
    { id: 0, name: 'Không thiệp', price: 0, preview: '/assets/no-card.jpg' },
    { id: 1, name: 'Thiệp Tiêu chuẩn', price: 5000, preview: '/assets/card-standard.jpg' },
    { id: 2, name: 'Thiệp Cao cấp', price: 15000, preview: '/assets/card-premium.jpg' },
];

// --- ICONS (ĐỒNG BỘ 1:1 VỚI PAYMENT PAGE) ---
const Icons = {
    Store: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>,
    Ticket: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
    Truck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.126-.504 1.126-1.125V15m0-1.5h-12.75a1.125 1.125 0 00-1.125 1.125v3.75M3.75 8.25h9m-9 3H12m0 0h5.5m-5.5 0h1.5m3 0h1.5m-3 0h-3.75a1.125 1.125 0 00-1.125 1.125V18a1.125 1.125 0 001.125 1.125M17.25 9l2.25 2.25m-2.25-2.25l2.25-2.25M17.25 9h-2.25" /></svg>,
    Message: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
    Coin: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v.166a3.836 3.836 0 01-1.72-.756.75.75 0 00-1.06 1.06c.978.978 2.31 1.469 3.53 1.469a3.836 3.836 0 001.72-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a4.53 4.53 0 00-1.719-.756v-.166c.569.11 1.153.37 1.72.756a.75.75 0 001.06-1.06c-.978-.978-2.31-1.469-3.53-1.469a3.836 3.836 0 00-1.72.756V6z" clipRule="evenodd" /></svg>,
    LocationPin: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
};

// --- SUB-COMPONENT: Coin Input (ĐỒNG BỘ 1:1 VỚI PAYMENT PAGE) ---
const CoinInputBlock = ({
    userPoints,
    appliedCoins,
    onCoinChange,
    orderTotal
}: {
    userPoints: number;
    appliedCoins: number;
    onCoinChange: (val: number) => void;
    orderTotal: number;
}) => {
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-5">
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

    // Stores
    const { isAuthenticated, _hasHydrated, user } = useUserStore();
    const {
        isBuyNowFlow,
        checkoutItems,
        senderInfo, setSenderInfo,
        receiverInfo, setReceiverInfo,
        selectedVoucherId,
        shopMessages, setShopMessage,
        shopVouchers,
        appliedCoins, setAppliedCoins,
        cardIndex, setCardIndex,
        resetCheckout
    } = useCheckoutStore();

    useEffect(() => {
        if (_hasHydrated) {
            if (!isAuthenticated) {
                const next = encodeURIComponent(window.location.pathname + window.location.search);
                router.replace(`/login?next=${next}`);
            } else {
                if (!document.cookie.includes('accessToken=')) {
                    document.cookie = 'accessToken=client_auth_bypass; path=/; max-age=86400; SameSite=Lax';
                }
            }
        }
    }, [_hasHydrated, isAuthenticated, router]);

    const dataParam = searchParams.get('data');

    const [orderData, setOrderData] = useState<any>({
        items: [], subtotal: 0, shippingFee: 0, shippingDiscount: 0,
        voucherDiscount: 0, coinDiscount: 0, giftWrapFee: 0, total: 0
    });

    // --- MODAL & ĐA VOUCHER (ĐỒNG BỘ 1:1 PAYMENT PAGE) ---
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherPool, setVoucherPool] = useState<{ global: Voucher[]; product: Voucher[] }>({ global: [], product: [] });
    const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);

    // Local States
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedGiftWrap, setSelectedGiftWrap] = useState<number | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string>('cod');

    const SHIPPING_FEE_PER_SHOP = 30000;

    useEffect(() => { setIsMounted(true); }, []);

    // 1. DATA SẢN PHẨM (Cart vs Buy Now)
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

    // Gộp vào 1 shop LoveGifts duy nhất (Web bán lẻ/thương mại)
    const groupedItems = useMemo(() => {
        if (!validPaymentItems || validPaymentItems.length === 0) return [];
        return [
            {
                shopId: 'lovegifts',
                shopName: 'LoveGifts',
                items: validPaymentItems,
            }
        ];
    }, [validPaymentItems]);

    const computeVoucherDiscount = (v: any, baseAmount: number): number => {
        if (!v) return 0;
        const raw = v.amount ?? v.discountValue ?? 0;
        if (v.type === 'PERCENTAGE') {
            let d = Math.floor((baseAmount * raw) / 100);
            if (v.maxDiscount && v.maxDiscount > 0) d = Math.min(d, v.maxDiscount);
            return d;
        }
        return raw;
    };

    // --- LOGIC TÍNH TIỀN TẠI CLIENT & PREVIEW ORDER ---
    const frontendCalculations = useMemo(() => {
        const s = orderData?.summary;
        let subtotal = 0;
        let totalShipping = 0;

        groupedItems.forEach((group) => {
            const groupSum = group.items.reduce((sum: number, item: any) => sum + (Number(item.price ?? 0) * Number(item.quantity ?? 0)), 0);
            subtotal += groupSum;
            totalShipping += SHIPPING_FEE_PER_SHOP;
        });

        const currentGiftWrapFee = selectedGiftWrap !== null ? giftWrapData[selectedGiftWrap].price : 0;
        const currentCardFee = CARD_OPTIONS.find(c => c.id === cardIndex)?.price || 0;
        const combinedGiftFee = currentGiftWrapFee + currentCardFee;

        const localTotalVoucherDiscount = selectedVouchers.reduce((acc, v) => acc + computeVoucherDiscount(v, subtotal), 0);

        if (s) {
            const freeship = s.discounts?.freeship || 0;
            const shopDisc = s.discounts?.shopVoucher || 0;
            const sysDisc = s.discounts?.systemVoucher || 0;
            return {
                subtotal: s.subtotal ?? subtotal,
                shippingFee: Math.max(0, (s.shippingFee ?? totalShipping) - freeship),
                shopDiscount: shopDisc,
                systemDiscount: sysDisc,
                voucherDiscountTotal: shopDisc + sysDisc,
                coinDiscount: s.discounts?.coin || 0,
                giftWrapFee: s.giftFee ?? combinedGiftFee,
                total: Math.max(0, s.total ?? 0),
            };
        }

        const fallbackTotal = subtotal + totalShipping + combinedGiftFee - localTotalVoucherDiscount - appliedCoins;
        return {
            subtotal,
            shippingFee: totalShipping,
            shopDiscount: 0,
            systemDiscount: localTotalVoucherDiscount,
            voucherDiscountTotal: localTotalVoucherDiscount,
            coinDiscount: appliedCoins || 0,
            giftWrapFee: combinedGiftFee,
            total: fallbackTotal > 0 ? fallbackTotal : 0
        };
    }, [groupedItems, orderData, selectedGiftWrap, appliedCoins, cardIndex, selectedVouchers]);

    // --- LOGIC: FETCH VOUCHERS CHO MODAL TẬP TRUNG ---
    const handleOpenVoucherModal = async () => {
        setIsVoucherModalOpen(true);
        try {
            setVoucherLoading(true);
            const res = await VoucherService.getMyVouchers();
            const list = Array.isArray(res) ? res : [];
            setVoucherPool({
                global: list.filter(v => v.scope === 'GLOBAL'),
                product: list.filter(v => ['SHOP', 'PRODUCT'].includes(v.scope))
            });
        } catch (err) {
            console.error("Lỗi lấy vouchers:", err);
            toast.error("Không thể tải danh sách ưu đãi");
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleToggleVoucherItem = (voucher: Voucher) => {
        const isSelected = selectedVouchers.some(v => v.id === voucher.id);
        if (isSelected) {
            setSelectedVouchers(prev => prev.filter(v => v.id !== voucher.id));
        } else {
            if (voucher.scope === 'GLOBAL') {
                setSelectedVouchers(prev => [...prev.filter(v => v.scope !== 'GLOBAL'), voucher]);
            } else {
                setSelectedVouchers(prev => [...prev, voucher]);
            }
        }
    };

    // --- LOGIC: ĐỊA CHỈ & MODAL ---
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
    const buildPayload = useCallback((isPreview = false): CreateOrderPayload | null => {
        if (validPaymentItems.length === 0) return null;

        const voucherIds: string[] = selectedVouchers.map(v => v.id);

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
            cardIndex: cardIndex
        } as any;
    }, [
        validPaymentItems, isActuallyBuyNow, selectedVouchers,
        receiverInfo, senderInfo, selectedPayment, shopMessages,
        appliedCoins, selectedGiftWrap, cardIndex
    ]);

    // --- API PREVIEW TÍNH TIỀN ---
    useEffect(() => {
        if (!isMounted) return;
        const fetchPreview = async () => {
            if (validPaymentItems.length === 0 || !isAuthenticated) return;

            const payload = buildPayload(true);
            if (!payload) return;

            try {
                setIsLoading(true);
                const res = await OrderService.previewOrder(payload);
                if (res) setOrderData(res);
            } catch (error) {
                console.error("Preview error", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPreview, 400);
        return () => clearTimeout(timeoutId);
    }, [isMounted, validPaymentItems, isAuthenticated, buildPayload]);

    // --- XỬ LÝ ĐẶT HÀNG ---
    const handleOrder = async () => {
        // Chặn khi chưa chọn sản phẩm nào
        if (validPaymentItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
            return;
        }

        if (!senderInfo.name || !senderInfo.phone || !senderInfo.address) return toast.error("Vui lòng điền thông tin người tặng");
        if (!receiverInfo.name || !receiverInfo.phone || !receiverInfo.address) return toast.error("Vui lòng điền thông tin người nhận");
        if (selectedPayment !== 'cod') return toast.error("Vui lòng chọn thanh toán COD (Đang bảo trì Online).");

        const payload = buildPayload(false);
        if (!payload) {
            toast.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
            return;
        }

        try {
            setIsProcessing(true);
            const res = await OrderService.createOrder(payload);

            if (!isActuallyBuyNow) {
                await removeMultipleItems(selectedIds);
            }

            resetCheckout();
            toast.success("Đặt hàng quà tặng thành công!");

            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                const orderIds = res.orders.map((o: any) => o.id).join(',');
                router.push(`/payment/success?orderIds=${orderIds}`);
            }

        } catch (err: any) {
            const raw = err?.response?.data?.message;
            const msg = Array.isArray(raw) ? raw.join('\n') : (raw || err?.message || 'Có lỗi xảy ra khi tạo đơn.');
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isMounted || !isAuthenticated) return null;

    return (
        <div className="w-full max-w-[1200px] mx-auto py-8 px-4 bg-[#F8F9FA] min-h-screen font-sans">
            <Toaster position="top-center" />

            {/* Modals Địa Chỉ */}
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

            {/* Modal Đa Voucher Đồng Bộ 1:1 với PaymentPage */}
            {isVoucherModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsVoucherModalOpen(false)}
                    />

                    <div className="relative bg-white w-full sm:max-w-lg h-[85vh] sm:h-[620px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl z-10">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Chọn Mã Quà Tặng & Ưu Đãi</h3>
                                <p className="text-xs text-gray-500">Có thể chọn 1 mã toàn sàn và nhiều mã mặt hàng</p>
                            </div>
                            <button
                                onClick={() => setIsVoucherModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-5">
                            {voucherLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm">Đang tải mã ưu đãi...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Nhóm Voucher Mặt hàng / Sản phẩm */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center justify-between">
                                            <span>Voucher Mặt hàng quà tặng</span>
                                            <span className="text-orange-600 font-normal normal-case">Chọn được nhiều mã</span>
                                        </h4>
                                        {voucherPool.product.length > 0 ? (
                                            voucherPool.product.map(v => {
                                                const isSelected = selectedVouchers.some(item => item.id === v.id);
                                                const isEligible = frontendCalculations.subtotal >= (v.minOrderValue || 0);

                                                return (
                                                    <div
                                                        key={v.id}
                                                        onClick={() => isEligible && handleToggleVoucherItem(v)}
                                                        className={`flex items-stretch bg-white border rounded-xl overflow-hidden mb-3 transition-all cursor-pointer ${isSelected ? 'border-orange-500 bg-orange-50/40 shadow-sm' : 'border-gray-200 hover:border-orange-200'
                                                            } ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="w-24 bg-orange-50 flex flex-col items-center justify-center p-2 border-r border-dashed border-orange-200">
                                                            <span className="text-xs font-bold text-orange-600">SẢN PHẨM</span>
                                                            <span className="text-[11px] font-medium text-gray-500 mt-1">{v.code}</span>
                                                        </div>
                                                        <div className="flex-1 p-3 flex justify-between items-center">
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {v.type === 'PERCENTAGE' ? `Giảm ${v.amount}%` : `Giảm ${(v.amount / 1000).toLocaleString()}k`}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    Đơn tối thiểu {((v.minOrderValue || 0) / 1000).toLocaleString()}k
                                                                </p>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                readOnly
                                                                disabled={!isEligible}
                                                                className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-3 text-gray-400 text-xs bg-white rounded-lg border border-dashed">
                                                Chưa có voucher mặt hàng nào khả dụng
                                            </div>
                                        )}
                                    </div>

                                    {/* Nhóm Voucher Toàn đơn */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center justify-between">
                                            <span>Voucher Toàn Đơn Hàng (LoveGifts)</span>
                                            <span className="text-orange-600 font-normal normal-case">Tối đa 1 mã</span>
                                        </h4>
                                        {voucherPool.global.length > 0 ? (
                                            voucherPool.global.map(v => {
                                                const isSelected = selectedVouchers.some(item => item.id === v.id);
                                                const isEligible = frontendCalculations.subtotal >= (v.minOrderValue || 0);

                                                return (
                                                    <div
                                                        key={v.id}
                                                        onClick={() => isEligible && handleToggleVoucherItem(v)}
                                                        className={`flex items-stretch bg-white border rounded-xl overflow-hidden mb-3 transition-all cursor-pointer ${isSelected ? 'border-orange-500 bg-orange-50/40 shadow-sm' : 'border-gray-200 hover:border-orange-200'
                                                            } ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="w-24 bg-red-50 flex flex-col items-center justify-center p-2 border-r border-dashed border-red-200">
                                                            <span className="text-xs font-bold text-red-600">ĐƠN HÀNG</span>
                                                            <span className="text-[11px] font-medium text-gray-500 mt-1">{v.code}</span>
                                                        </div>
                                                        <div className="flex-1 p-3 flex justify-between items-center">
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {v.type === 'PERCENTAGE' ? `Giảm ${v.amount}%` : `Giảm ${(v.amount / 1000).toLocaleString()}k`}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    Đơn tối thiểu {((v.minOrderValue || 0) / 1000).toLocaleString()}k
                                                                </p>
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                checked={isSelected}
                                                                readOnly
                                                                disabled={!isEligible}
                                                                className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500 cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-3 text-gray-400 text-xs bg-white rounded-lg border border-dashed">
                                                Chưa có voucher toàn đơn
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t bg-white rounded-b-2xl shadow-sm flex items-center justify-between gap-4">
                            <div className="text-sm">
                                <span className="text-gray-500">Đã chọn: </span>
                                <span className="font-bold text-orange-600">{selectedVouchers.length} mã</span>
                            </div>
                            <button
                                onClick={() => {
                                    setIsVoucherModalOpen(false);
                                    toast.success(`Đã áp dụng ${selectedVouchers.length} mã ưu đãi`);
                                }}
                                className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-lg shadow hover:bg-orange-600 transition-all text-sm"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Đồng Bộ */}
            <div className="flex items-center gap-2 text-sm mb-6 text-gray-500 select-none">
                <span className="cursor-pointer hover:text-orange-600 transition-colors" onClick={() => router.push('/')}>Trang chủ</span> /
                <span className="cursor-pointer hover:text-orange-600 transition-colors" onClick={() => router.push('/cart')}>Giỏ hàng</span> /
                <span className="text-gray-800 font-medium">Thanh toán quà tặng</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start relative">
                {/* --- CỘT TRÁI --- */}
                <div className="flex-1 flex flex-col gap-5 w-full min-w-0">

                    {/* 1. ĐỊA CHỈ GIAO - NHẬN QUÀ (CÓ DẢI PHONG BÌ THƯ ĐẶC TRƯNG) */}
                    <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#F2542D,#F2542D_30px,#ffffff_30px,#ffffff_60px,#1b64da_60px,#1b64da_90px,#ffffff_90px,#ffffff_120px)] opacity-80"></div>

                        <div className="p-5 pt-6 border-b border-gray-100 flex items-center gap-2 text-orange-600">
                            <Icons.LocationPin />
                            <h3 className="font-bold text-base">Địa chỉ Giao - Nhận Quà Tặng</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-100">
                            {/* Cột 1: Người gửi */}
                            <div onClick={() => handleEditInfo('sender')} className="p-5 hover:bg-orange-50/20 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">1. Người gửi (Bạn)</span>
                                    <span className="text-blue-600 text-xs font-medium group-hover:underline">Thay đổi</span>
                                </div>
                                {senderInfo.name ? (
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">{senderInfo.name} <span className="text-sm font-normal text-gray-500">| {senderInfo.phone}</span></p>
                                        <p className="text-gray-600 mt-1.5 text-sm line-clamp-2 leading-relaxed">{senderInfo.address}</p>
                                    </div>
                                ) : (
                                    <p className="text-orange-500 text-sm italic py-1">Vui lòng thiết lập thông tin người gửi</p>
                                )}
                            </div>

                            {/* Cột 2: Người nhận */}
                            <div onClick={() => handleEditInfo('receiver')} className="p-5 hover:bg-orange-50/20 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">2. Người nhận quà</span>
                                    <span className="text-blue-600 text-xs font-medium group-hover:underline">Thay đổi</span>
                                </div>
                                {receiverInfo.name ? (
                                    <div>
                                        <p className="font-bold text-gray-900 text-base">{receiverInfo.name} <span className="text-sm font-normal text-gray-500">| {receiverInfo.phone}</span></p>
                                        <p className="text-gray-600 mt-1.5 text-sm line-clamp-2 leading-relaxed">{receiverInfo.address}</p>
                                        {receiverInfo.message && <p className="mt-2 text-xs italic text-gray-500 bg-gray-50 p-2 rounded border border-dashed border-gray-200">"{receiverInfo.message}"</p>}
                                    </div>
                                ) : (
                                    <p className="text-orange-500 text-sm italic py-1">Vui lòng thiết lập thông tin người nhận</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. SẢN PHẨM GROUP THEO SHOP (DÙNG CHUNG ORDER_ITEM VÀ LAYOUT PAYMENT) */}
                    {groupedItems.map((group) => {
                        const displayShippingFee = SHIPPING_FEE_PER_SHOP;
                        const shopItemTotal = group.items.reduce((acc: number, i: any) => acc + (Number(i.price ?? 0) * Number(i.quantity ?? 0)), 0);
                        const displayShopTotal = shopItemTotal + displayShippingFee;

                        return (
                            <div key={group.shopId} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                                    <Icons.Store />
                                    <span className="font-bold text-gray-800">{group.shopName}</span>
                                </div>

                                <div className="px-5 py-2 divide-y divide-gray-50">
                                    {group.items.map((item: any) => (
                                        <div key={item.id} className="py-2">
                                            <OrderItem
                                                productId={String(item.productId)}
                                                name={item.title || item.name}
                                                imageUrl={item.imageUrl || item.image}
                                                price={item.price}
                                                quantity={item.quantity}
                                                color={item.color}
                                                size={item.size}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-gray-200 bg-[#FDFDFD]">
                                    {/* Đơn vị vận chuyển đồng bộ Payment */}
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

                                    {/* Lời nhắn cho shop đồng bộ Payment */}
                                    <div className="px-5 py-4 flex items-center gap-3">
                                        <span className="text-gray-400"><Icons.Message /></span>
                                        <span className="text-sm text-gray-600 min-w-[60px]">Lời nhắn:</span>
                                        <input
                                            type="text"
                                            maxLength={191}
                                            placeholder="Lưu ý cho người bán..."
                                            value={shopMessages[group.shopId] || ''}
                                            onChange={(e) => setShopMessage(group.shopId, e.target.value)}
                                            className="flex-1 text-sm border-b border-gray-200 focus:border-orange-400 outline-none bg-transparent py-1"
                                        />
                                    </div>

                                    {/* Tạm tính đồng bộ Payment */}
                                    <div className="px-5 py-3 flex justify-end items-center gap-2 border-t border-gray-100 bg-gray-50 text-sm">
                                        <span className="text-gray-500">Tạm tính ({group.items.length} sản phẩm):</span>
                                        <span className="text-lg font-bold text-orange-600">
                                            ₫{displayShopTotal.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* 3. DỊCH VỤ GÓI QUÀ (ĐỒNG BỘ ROUNDED-LG VÀ BORDER CHUẨN) */}
                    <div className="bg-white rounded-lg shadow-sm border border-orange-200/80 overflow-hidden">
                        <div className="bg-orange-50/70 px-5 py-3.5 border-b border-orange-100 flex items-center gap-2">
                            <GiftIcon className="text-orange-600" size={18} />
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Dịch vụ Gói Quà</h3>
                        </div>
                        <div className="p-5">
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {giftWrapData.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedGiftWrap(selectedGiftWrap === index ? null : index)}
                                        className={`
                      cursor-pointer rounded-xl p-[2px] transition-all duration-200 flex-shrink-0
                      ${selectedGiftWrap === index ? 'ring-2 ring-orange-500 scale-102 shadow-md' : 'hover:opacity-90 opacity-75'}
                    `}
                                    >
                                        <GiftWrapCard {...item} selected={selectedGiftWrap === index} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. MẪU THIỆP CHÚC MỪNG & LỜI CHÚC */}
                    <div className="bg-white rounded-lg shadow-sm border border-orange-200/80 overflow-hidden">
                        <div className="bg-orange-50/70 px-5 py-3.5 border-b border-orange-100 flex items-center gap-2">
                            <MailIcon className="text-orange-600" size={18} />
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Mẫu thiệp chúc mừng</h3>
                        </div>

                        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3.5">
                            {CARD_OPTIONS.map((card) => {
                                const isSelected = cardIndex === card.id;

                                return (
                                    <div
                                        key={card.id}
                                        onClick={() => setCardIndex(card.id)}
                                        className={`relative cursor-pointer rounded-lg border p-3 transition-all duration-200 ${isSelected
                                            ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-1 ring-orange-500'
                                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="aspect-[4/3] bg-gray-100 rounded-md mb-2.5 overflow-hidden relative">
                                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400 font-medium bg-gray-200">
                                                {card.id === 0 ? 'Không kèm thiệp' : 'Hình ảnh thiệp'}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {card.name}
                                            </p>
                                            <p className="text-orange-600 text-xs font-bold mt-0.5">
                                                {card.price === 0 ? 'Miễn phí' : `+${card.price.toLocaleString('vi-VN')} ₫`}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-0.5 shadow-sm">
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="px-5 pb-5">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-semibold text-gray-800">
                                    Lời chúc gửi người nhận
                                </span>
                                <textarea
                                    value={senderInfo.message || ''}
                                    onChange={(e) => setSenderInfo({ ...senderInfo, message: e.target.value.slice(0, 500) })}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Ví dụ: Chúc mừng sinh nhật cậu! Mong cậu luôn vui vẻ và mạnh khoẻ nhé."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                                />
                                <span className="text-xs text-gray-400 self-end">
                                    {(senderInfo.message || '').length}/500
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* 5. KHỐI VOUCHER TẬP TRUNG (ĐỒNG BỘ PAYMENT PAGE) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div
                            className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                            onClick={handleOpenVoucherModal}
                        >
                            <div className="flex items-center gap-2 text-red-600 font-medium">
                                <Icons.Ticket />
                                <span>Mã Giảm Giá & Ưu Đãi</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 text-sm">
                                <span>
                                    {selectedVouchers.length > 0
                                        ? `Đã chọn ${selectedVouchers.length} mã (-${frontendCalculations.voucherDiscountTotal.toLocaleString()}đ)`
                                        : 'Chọn hoặc nhập mã ưu đãi'}
                                </span>
                                <Icons.ChevronRight />
                            </div>
                        </div>
                    </div>

                    {/* Khối Nhập Xu Đồng Bộ */}
                    <CoinInputBlock
                        userPoints={user?.point || 0}
                        appliedCoins={appliedCoins}
                        onCoinChange={(val: number) => setAppliedCoins(val)}
                        orderTotal={frontendCalculations.subtotal}
                    />

                    {/* 6. PHƯƠNG THỨC THANH TOÁN (ĐỒNG BỘ 1:1 VỚI PAYMENT PAGE) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-800 mb-4">Phương thức thanh toán</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {PAYMENT_METHODS.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedPayment === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                        }`}>
                                        {selectedPayment === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">{method.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI (STICKY SUMMARY) --- */}
                <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-4 z-10 h-fit">
                    <OrderSummaryBox
                        subtotal={frontendCalculations.subtotal}
                        shippingFee={frontendCalculations.shippingFee}
                        shippingDiscount={0}
                        voucherDiscount={frontendCalculations.voucherDiscountTotal}
                        coinDiscount={frontendCalculations.coinDiscount}
                        giftWrapFee={frontendCalculations.giftWrapFee}
                        total={frontendCalculations.total}
                        onPlaceOrder={handleOrder}
                        buttonText="Thanh toán & Gửi quà"
                        loading={isLoading || isProcessing}
                    />
                </div>
            </div>
        </div>
    );
};

export default GiftPaymentPage;
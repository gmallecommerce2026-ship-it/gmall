// src/modules/product-details/components/StickyBuyBox.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { ShieldCheck, Star, MessageSquare, ShoppingCart, Zap, Gift } from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useTracking, EventType } from "@/hooks/useTracking";

import QuantitySelector from "./QuantitySelector";
import VariantSelector from "./VariantSelector";
import ProductVouchers from "./ProductVouchers";

import { Product } from "@/types/product";
import { CartItem } from "@/types/cart";
import { ShopProfileData } from "./ShopInfo";
import { applyVariantDisplayOrder } from "@/lib/variant-order";

interface StickyBuyBoxProps {
  product: Product;
  shopProfile: ShopProfileData | null;
  vouchers: any[];
  onHoverVariant?: (image: string | null) => void;
  /** Wiki 0104 (đợt 4): thông báo biến thể + giá đang chọn cho trang cha. */
  onVariantChange?: (info: { variantId?: string; price: number }) => void;
}

export const StickyBuyBox: React.FC<StickyBuyBoxProps> = ({
  product,
  shopProfile,
  vouchers,
  onHoverVariant,
  onVariantChange,
}) => {
  const router = useRouter();
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { setBuyNowItem } = useCheckoutStore();
  const { track } = useTracking();

  const [selections, setSelections] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isGifting, setIsGifting] = useState(false);

  // Khởi tạo phiên bản mặc định
  useEffect(() => {
    if (product.tiers && product.tiers.length > 0) {
      let defaultIndexes: any = new Array(product.tiers.length).fill(0);
      if (product.variants && product.variants.length > 0) {
        const availableVariant = product.variants.find((v) => v.stock > 0);
        if (availableVariant && availableVariant.tierIndex) {
          defaultIndexes = availableVariant.tierIndex;
        } else if (product.variants[0].tierIndex) {
          defaultIndexes = product.variants[0].tierIndex;
        }
      }
      setSelections(defaultIndexes);
    } else {
      setSelections([]);
    }
  }, [product.tiers, product.variants]);

  // Variant đang được chọn
  const currentVariant = useMemo(() => {
    if (!product.tiers?.length || !product.variants?.length) return null;
    const isFullSelected = selections.length > 0 && selections.every((idx) => idx !== -1);
    if (selections.length === 0 || !isFullSelected) return null;
    return product.variants.find(
      (v: any) =>
        v.tierIndex.length === selections.length &&
        v.tierIndex.every((val: any, i: any) => val === selections[i])
    );
  }, [selections, product.tiers, product.variants]);

  const activeDiscountPercent = useMemo(() => {
    if (!product.isDiscountActive) return 0;
    if (currentVariant && currentVariant.discountValue !== undefined) {
      return currentVariant.discountValue;
    }
    return product.discountValue || 0;
  }, [product, currentVariant]);

  const originalPriceToDisplay = currentVariant
    ? currentVariant.originalPrice || currentVariant.price / (1 - activeDiscountPercent / 100)
    : product.originalPrice || product.regularPrice;

  const finalPrice = currentVariant
    ? currentVariant.originalPrice
      ? currentVariant.originalPrice * (1 - activeDiscountPercent / 100)
      : currentVariant.price
    : product.originalPrice
    ? product.originalPrice * (1 - activeDiscountPercent / 100)
    : product.price;

  const displayStock = currentVariant
    ? currentVariant.stock
    : product.stock || product.stockTotal || 0;

  const subtotal = Number(finalPrice || 0) * quantity;

  // Wiki 0104 (đợt 4): báo biến thể + giá đang chọn RA NGOÀI cho trang cha.
  //
  // Vì sao cần: khối "Thường được mua cùng" nằm ở cột khác, không thấy được state này,
  // nên nó hiển thị `product.price` (giá GỐC) trong khi khách đang chọn một biến thể có
  // giá khác — hai con số cãi nhau trên cùng một màn hình, và "Tổng tiền (3 món)" được
  // tính từ giá không phải giá sẽ trả.
  //
  // Chỉ THÊM một lời gọi ra ngoài, KHÔNG sửa gì trong luồng thêm-giỏ/mua-ngay của khung
  // này — đây là đường đi của tiền, không refactor khi chưa có cách kiểm chứng trực quan.
  // Deps là `currentVariant?.id` + `finalPrice` (giá trị nguyên thuỷ) nên dù trang cha
  // re-render, effect không chạy lại ⇒ không có vòng lặp set-state.
  useEffect(() => {
    if (!onVariantChange) return;
    onVariantChange({
      variantId: currentVariant?.id,
      price: Number(finalPrice || 0),
    });
  }, [onVariantChange, currentVariant?.id, finalPrice]);

  const formatPrice = (p: number | string | undefined | null) => {
    if (p === undefined || p === null) return "Liên hệ";
    const num = Number(p);
    if (isNaN(num) || num === 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const handleSelectOption = (tierIndex: number, optionIndex: number) => {
    const newSelections = [...selections];
    newSelections[tierIndex] = optionIndex;
    setSelections(newSelections);
  };

  const getVariantName = () => {
    return product.tiers
      ? selections
          .map((s, i) => (s !== -1 && product.tiers![i].options[s] ? product.tiers![i].options[s] : ""))
          .filter(Boolean)
          .join(", ")
      : "";
  };

  const validateSelection = (checkStock = true) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      router.push(`/login?redirect=/product-details/${product.id}`);
      return false;
    }
    if (product.tiers && product.tiers.length > 0) {
      const missingIndex = selections.findIndex((s) => s === -1);
      if (missingIndex !== -1) {
        toast.error(`Vui lòng chọn ${product.tiers[missingIndex].name}`);
        return false;
      }
      if (!currentVariant) {
        toast.error("Phiên bản này hiện không khả dụng");
        return false;
      }
    }
    if (checkStock) {
      if (displayStock <= 0) {
        toast.error("Sản phẩm tạm hết hàng");
        return false;
      }
      if (quantity > displayStock) {
        toast.error(`Chỉ còn ${displayStock} sản phẩm`);
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateSelection()) return;
    setIsAddingCart(true);
    try {
      const variantName = getVariantName();
      const payload = {
        productId: product.id,
        productVariantId: currentVariant?.id || undefined,
        name: product.title,
        price: Number(finalPrice),
        imageUrl: currentVariant?.imageUrl || product.imageUrl,
        variantName: variantName,
        shopId: product.shopId || product.sellerId,
        shopName: product.shopName,
      };

      if (track) {
        track(EventType.ADD_TO_CART, product.id, {
          price: payload.price,
          quantity,
          variant: variantName,
        });
      }
      await addToCart(payload, quantity);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    const variantName = getVariantName();
    const tempItem: CartItem = {
      id: `buynow-${Date.now()}`,
      productId: product.id,
      productVariantId: currentVariant?.id,
      title: product.title,
      imageUrl: currentVariant?.imageUrl || product.imageUrl,
      price: Number(finalPrice),
      quantity: quantity,
      stock: displayStock,
      shopId: product.shopId || product.sellerId || "unknown-shop",
      shopName: product.shopName || "Cửa hàng",
      variantName: variantName,
    };
    setBuyNowItem(tempItem);
    router.push("/payment");
  };

  const handleGiftNow = () => {
    if (!validateSelection()) return;
    setIsGifting(true);
    const checkoutData = {
      productId: product.id,
      productVariantId: currentVariant?.id,
      variantId: currentVariant?.id,
      quantity: quantity,
      selectedOptions: product.tiers
        ? selections.map((s, i) => ({
            name: product.tiers![i].name,
            value: product.tiers![i].options[s],
          }))
        : [],
    };

    const query = encodeURIComponent(
      Buffer.from(JSON.stringify([checkoutData])).toString("base64")
    );

    setTimeout(() => {
      router.push(`/gift-payment?data=${query}`);
      setIsGifting(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-4 sticky top-24 z-20">
      <Toaster position="top-right" containerStyle={{ top: 80 }} />

      {/* Box Mua Hàng Chính */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        {/* Header Shop / Thương hiệu */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center">
              {/* Wiki 0094: trước đây đọc `shopProfile.avatar` — ShopProfileData KHÔNG có
                  trường đó (đúng tên là `avatarUrl`) nên luôn undefined → ảnh đại diện shop
                  KHÔNG BAO GIỜ hiện, luôn rơi về chữ cái placeholder. */}
              {shopProfile?.avatarUrl ? (
                <img src={shopProfile.avatarUrl} alt={shopProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-gray-500 text-sm">
                  {product.brand?.charAt(0) || "S"}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 text-sm truncate">
                  {shopProfile?.name || product.brand || "Cửa hàng chính hãng"}
                </span>
                <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                  <ShieldCheck size={11} /> OFFICIAL
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center text-yellow-500 font-semibold gap-0.5">
                  <Star size={12} fill="currentColor" /> {product.rating || "5.0"}
                </span>
                <span>•</span>
                <span>Đã bán {product.salesCount || 0}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors shrink-0"
            title="Chat với Shop"
          >
            <MessageSquare size={18} />
          </button>
        </div>

        {/* Voucher */}
        <ProductVouchers vouchers={vouchers} />

        {/* Chọn Variant (Màu sắc / Phân loại) */}
        {product.tiers &&
          product.tiers.length > 0 &&
          product.tiers.map((tier, idx) => {
            // wiki 0095 B2: trước đây sort bằng
            //   localeCompare(..., { numeric: true })
            // → chỉ so cụm số đầu, bỏ qua đơn vị ⇒ "1TB, 2TB, 256GB, 512GB".
            // Ngoài ra `images` KHÔNG được sort kèm nên ảnh swatch lệch nhãn.
            // applyVariantDisplayOrder quy đổi đơn vị về giá trị nền, sắp cả
            // options lẫn images, và trả originalIndexes để giữ đúng mapping
            // sang variants[].tierIndex.
            const { tier: orderedTier, originalIndexes } =
              applyVariantDisplayOrder(tier);

            const selectedSortedIndex = originalIndexes.indexOf(selections[idx]);

            return (
              <VariantSelector
                key={idx}
                tier={orderedTier}
                selectedIndex={selectedSortedIndex}
                onSelect={(sortedIdx) => {
                  handleSelectOption(idx, originalIndexes[sortedIdx]);
                }}
                onHoverOption={(img) => {
                  if (onHoverVariant) onHoverVariant(img);
                }}
              />
            );
          })}

        {/* Số lượng */}
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Số lượng
          </label>
          <div className="flex items-center justify-between">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <span className="text-xs text-gray-500 font-medium">
              {displayStock > 0 ? `Còn ${displayStock} SP` : "Hết hàng"}
            </span>
          </div>
        </div>

        {/* Giá & Tạm tính */}
        <div className="flex flex-col gap-1 pt-3 border-t border-gray-100 bg-gray-50/50 p-3 rounded-xl">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-500 font-medium">Tạm tính:</span>
            <span className="text-2xl font-extrabold text-brand-orange tracking-tight">
              {formatPrice(subtotal)}
            </span>
          </div>
          {originalPriceToDisplay && originalPriceToDisplay > finalPrice && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Đơn giá gốc:</span>
              <span className="line-through">{formatPrice(originalPriceToDisplay)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={displayStock === 0}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap size={16} fill="currentColor" />
            {displayStock === 0 ? "Tạm hết hàng" : "Mua Ngay"}
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingCart || displayStock === 0}
            className="w-full h-11 border-2 border-brand-orange text-brand-orange bg-orange-50/50 hover:bg-orange-100 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            {isAddingCart ? "Đang thêm..." : "Thêm vào giỏ"}
          </button>

          <button
            type="button"
            onClick={handleGiftNow}
            disabled={isGifting || displayStock === 0}
            className="w-full h-10 border border-dashed border-gray-300 hover:border-brand-orange text-gray-600 hover:text-brand-orange bg-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Gift size={14} />
            {isGifting ? "Đang xử lý..." : "Tặng người thân"}
          </button>
        </div>
      </div>
    </div>
  );
};
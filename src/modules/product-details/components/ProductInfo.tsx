// src/modules/product-details/components/ProductInfo.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";

import Button from "@/components/ui/Button";
import ProductVouchers from "./ProductVouchers";
import QuantitySelector from "./QuantitySelector";
import VariantSelector from "./VariantSelector";

import { Product } from "@/types/product";
import { CartItem } from "@/types/cart";
import { useTracking, EventType } from "@/hooks/useTracking";

interface ProductInfoProps {
  product: Product;
  vouchers: any[];
  onHoverVariant?: (image: string | null) => void;
  // Các props đồng bộ bổ sung
  quantity?: number;
  onQuantityChange?: (q: number) => void;
  onSyncState?: (state: {
    finalPrice: number;
    displayStock: number;
    currentVariant: any;
    handleAddToCart: () => Promise<void>;
    handleBuyNow: () => void;
    handleGiftNow: () => void;
    isAddingCart: boolean;
    isGifting: boolean;
  }) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  vouchers,
  onHoverVariant,
  quantity: externalQuantity,
  onQuantityChange,
  onSyncState,
}) => {
  const router = useRouter();
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { setBuyNowItem } = useCheckoutStore();
  const { track } = useTracking();

  const [selections, setSelections] = useState<number[]>([]);
  const [internalQuantity, setInternalQuantity] = useState(1);

  const quantity = externalQuantity !== undefined ? externalQuantity : internalQuantity;
  const setQuantity = onQuantityChange || setInternalQuantity;

  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isGifting, setIsGifting] = useState(false);

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

  const formatPrice = (p: number | string | undefined | null) => {
    if (p === undefined || p === null) return "Liên hệ";
    const num = Number(p);
    if (isNaN(num) || num === 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  let discountBadge = null;
  if (product.isDiscountActive && product.originalPrice && !currentVariant) {
    if (product.discountType === "PERCENT") {
      discountBadge = `-${product.discountValue}%`;
    } else if (product.discountType === "AMOUNT") {
      const percent = Math.round((product.discountValue! / product.originalPrice) * 100);
      discountBadge = `-${percent}%`;
    }
  }

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

  useEffect(() => {
    if (onSyncState) {
      onSyncState({
        finalPrice: Number(finalPrice),
        displayStock,
        currentVariant,
        handleAddToCart,
        handleBuyNow,
        handleGiftNow,
        isAddingCart,
        isGifting,
      });
    }
  }, [finalPrice, displayStock, currentVariant, isAddingCart, isGifting, quantity]);

  return (
    <div className="flex flex-col gap-6 relative">
      <Toaster position="top-right" containerStyle={{ top: 80 }} />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
          {product.title}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-yellow-500">
            <span>★★★★★</span>
            <span className="text-gray-500 ml-2">({product.rating || 5.0})</span>
          </div>
          <span className="w-[1px] h-4 bg-gray-300"></span>
          <span className="text-gray-500">Đã bán {product.salesCount || 0}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative overflow-hidden">
        {discountBadge && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
            GIẢM {discountBadge}
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <span className="text-3xl font-extrabold text-brand-orange tracking-tight">
            {formatPrice(finalPrice)}
          </span>

          {originalPriceToDisplay && originalPriceToDisplay > finalPrice && (
            <div className="flex flex-col items-start leading-none mb-1">
              <span className="text-xs text-gray-400">Giá gốc</span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPriceToDisplay)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <ProductVouchers vouchers={vouchers} />

        {product.tiers &&
          product.tiers.length > 0 &&
          product.tiers.map((tier, idx) => {
            const mappedOptions = tier.options.map((opt: string, originalIdx: number) => ({
              label: opt,
              originalIdx,
            }));

            const sortedOptions = [...mappedOptions].sort((a, b) =>
              a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
            );

            const orderedTier = {
              ...tier,
              options: sortedOptions.map((o) => o.label),
            };

            const selectedSortedIndex = sortedOptions.findIndex(
              (o) => o.originalIdx === selections[idx]
            );

            return (
              <VariantSelector
                key={idx}
                tier={orderedTier}
                selectedIndex={selectedSortedIndex}
                onSelect={(sortedIdx) => {
                  const originalIndex = sortedOptions[sortedIdx].originalIdx;
                  handleSelectOption(idx, originalIndex);
                }}
                onHoverOption={(img) => {
                  if (onHoverVariant) onHoverVariant(img);
                }}
              />
            );
          })}

        <div className="flex items-center gap-6 pt-2">
          <label className="text-sm font-semibold text-gray-900">Số lượng</label>
          <div className="flex items-center gap-4">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <span className="text-sm text-gray-500">
              {displayStock > 0 ? `${displayStock} sản phẩm có sẵn` : "Hết hàng"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3 h-12">
          <Button
            variant="secondary"
            className="flex-1 text-brand-orange bg-orange-50 border-brand-orange border hover:bg-orange-100 font-bold transition-all disabled:opacity-70"
            onClick={handleAddToCart}
            disabled={isAddingCart || displayStock === 0}
          >
            {isAddingCart ? "Đang thêm..." : "Thêm vào giỏ"}
          </Button>

          <Button
            variant="primary"
            className="flex-1 bg-gradient-to-r from-brand-orange to-red-500 hover:to-red-600 text-white shadow-lg shadow-orange-200 font-bold transform transition-transform active:scale-[0.98] disabled:opacity-70"
            onClick={handleBuyNow}
            disabled={displayStock === 0}
          >
            {displayStock === 0 ? "Hết hàng" : "Mua Ngay"}
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full h-11 border border-dashed border-orange-300 text-orange-400 bg-orange-50 hover:bg-orange-100 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          onClick={handleGiftNow}
          disabled={isGifting || displayStock === 0}
        >
          {isGifting ? "Đang xử lý..." : "Tặng người thân"}
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
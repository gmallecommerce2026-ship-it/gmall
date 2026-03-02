"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import Button from "@/components/ui/Button";
import ProductVouchers from "./ProductVouchers";
import QuantitySelector from "./QuantitySelector";
import VariantSelector from "./VariantSelector";
import { Product } from "@/types/product";
import { useTracking, EventType } from "@/hooks/useTracking";

interface ProductInfoProps {
  product: Product;
  vouchers: any[];
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, vouchers }) => {
  const router = useRouter();
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { track } = useTracking();
  
  // --- STATE ---
  // Mặc định selections là mảng rỗng
  const [selections, setSelections] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isGifting, setIsGifting] = useState(false);


  console.log("DEBUG: Product Tiers:", product.tiers);
  console.log("DEBUG: Product Variations:", product.variations);
  
  // Kiểm tra xem biến thể có field tierIndex không?
  if (product.variations?.length) {
      console.log("DEBUG: Sample Variation tierIndex:", product.variations[0].tierIndex);
  }
  // --- [FIX 1] AUTO SELECT DEFAULT VARIANT ---
  useEffect(() => {
    if (product.tiers && product.tiers.length > 0) {
      // Logic: Tìm biến thể đầu tiên có stock > 0 để active
      let defaultIndexes = new Array(product.tiers.length).fill(0); // Mặc định chọn 0,0...

      if (product.variations && product.variations.length > 0) {
        const availableVariant = product.variations.find((v) => v.stock > 0);
        if (availableVariant && availableVariant.tierIndex) {
            defaultIndexes = availableVariant.tierIndex;
        } else {
            // Nếu không có cái nào còn hàng, lấy cái đầu tiên trong danh sách variations
             if (product.variations[0].tierIndex) {
                 defaultIndexes = product.variations[0].tierIndex;
             }
        }
      }
      
      setSelections(defaultIndexes);
    } else {
      setSelections([]);
    }
  }, [product.tiers, product.variations]); // Thêm variations vào dependency

  // --- LOGIC TÌM BIẾN THỂ (Variant) ---
  const currentVariant = useMemo(() => {
    // Nếu sản phẩm không có phân loại, return null
    if (!product.tiers?.length || !product.variations?.length) return null;

    // Kiểm tra xem đã chọn đủ các options chưa (không còn giá trị -1)
    const isFullSelected = selections.length > 0 && selections.every(idx => idx !== -1);
    
    // [FIX UI] Nếu chưa load xong selections, chưa return
    if (selections.length === 0) return null; 

    if (!isFullSelected) return null;

    // Tìm variant khớp với các lựa chọn
    return product.variations.find(v => 
      v.tierIndex.length === selections.length &&
      v.tierIndex.every((val, i) => val === selections[i])
    );
  }, [selections, product.tiers, product.variations]);

  // --- HIỂN THỊ GIÁ ---
  // [FIX 2] Ưu tiên giá variant, nếu không có thì lấy giá product, nếu product.price null thì lấy 0
  const displayPrice = currentVariant ? currentVariant.price : (product.price || 0);
  const displayStock = currentVariant ? currentVariant.stock : (product.stock || product.stockTotal || 0);

  // [FIX 3] Hàm format giá cải tiến
  const formatPrice = (p: number | string | undefined | null) => {
     if (p === undefined || p === null) return "Liên hệ"; // Trường hợp null thật sự
     const num = Number(p);
     if (isNaN(num)) return "Liên hệ";
     if (num === 0) return "Liên hệ"; // Nếu giá = 0 cũng hiển thị liên hệ (tuỳ nghiệp vụ)
     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // --- VALIDATION ---
  const validateSelection = (checkStock = true) => {
    if (!user) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        router.push(`/login?redirect=/product-details/${product.id}`);
        return false;
    }

    // 1. Kiểm tra chọn phân loại
    if (product.tiers && product.tiers.length > 0) {
        const missingIndex = selections.findIndex(s => s === -1);
        if (missingIndex !== -1) {
            toast.error(`Vui lòng chọn ${product.tiers[missingIndex].name}`);
            return false;
        }
        if (!currentVariant) {
            // Trường hợp chọn đủ option nhưng không map được ra variant nào (dữ liệu lỗi)
            toast.error("Phiên bản này hiện không khả dụng");
            return false;
        }
    }

    // 2. Kiểm tra tồn kho
    if (checkStock) {
        const stockToCheck = displayStock;
        if (stockToCheck <= 0) {
            toast.error("Sản phẩm tạm hết hàng");
            return false;
        }
        if (quantity > stockToCheck) {
            toast.error(`Chỉ còn ${stockToCheck} sản phẩm`);
            return false;
        }
    }

    return true;
  };

  // --- HANDLERS ---
  const handleSelectOption = (tierIndex: number, optionIndex: number) => {
    const newSelections = [...selections];
    
    // [UX Update] Không cho phép deselect (bỏ chọn) để tránh giá bị nhảy về "Liên hệ"
    // Nếu muốn cho phép bỏ chọn thì uncomment dòng dưới:
    // if (newSelections[tierIndex] === optionIndex) newSelections[tierIndex] = -1;
    
    newSelections[tierIndex] = optionIndex; 
    setSelections(newSelections);
  };

  const handleAddToCart = async () => {
    if (!validateSelection()) return;

    setIsAddingCart(true);
    try {
        const variantName = product.tiers 
            ? selections.map((s, i) => (s !== -1 && product.tiers![i].options[s]) ? product.tiers![i].options[s] : "").filter(Boolean).join(", ") 
            : "";

        const payload = {
            productId: product.id,
            productVariantId: currentVariant?.sku || currentVariant?.id || undefined,
            name: product.title,
            price: Number(displayPrice),
            imageUrl: currentVariant?.imageUrl || product.imageUrl,
            variantName: variantName,
        };
        
        // [Safety Check] Tracking
        if (track) {
            track(EventType.ADD_TO_CART, product.id, { 
                price: payload.price, 
                quantity,
                variant: variantName 
            });
        }

        await addToCart(payload, quantity);
        toast.success("Đã thêm vào giỏ hàng");
    } catch (e) {
        console.error(e);
        toast.error("Lỗi thêm giỏ hàng");
    } finally {
        setIsAddingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    
    const checkoutData = {
        productId: product.id,
        variantId: currentVariant?.sku || currentVariant?.id, 
        quantity: quantity,
        selectedOptions: product.tiers ? selections.map((s, i) => ({
            name: product.tiers![i].name,
            value: product.tiers![i].options[s]
        })) : []
    };

    const query = Buffer.from(JSON.stringify([checkoutData])).toString('base64');
    router.push(`/payment?data=${query}`);
  };

  const handleGiftNow = () => {
    if (!validateSelection()) return;
    
    setIsGifting(true);

    const checkoutData = {
        productId: product.id,
        variantId: currentVariant?.sku || currentVariant?.id,
        quantity: quantity,
        selectedOptions: product.tiers ? selections.map((s, i) => ({
            name: product.tiers![i].name,
            value: product.tiers![i].options[s]
        })) : []
    };

    const query = Buffer.from(JSON.stringify([checkoutData])).toString('base64');
    
    setTimeout(() => {
        router.push(`/gift-payment?data=${query}`);
        setIsGifting(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <Toaster position="top-right" containerStyle={{ top: 80 }} />

      {/* 1. Header */}
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

      {/* 2. Price */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-extrabold text-brand-orange tracking-tight">
                {formatPrice(displayPrice)}
            </span>
            
            {/* Giá gốc (nếu có biến thể và có giảm giá) */}
            {currentVariant?.originalPrice && currentVariant.originalPrice > displayPrice && (
                <span className="text-sm text-gray-500 line-through mb-1">
                    {formatPrice(currentVariant.originalPrice)}
                </span>
            )}
             {/* Giá gốc (nếu là sản phẩm thường và có giảm giá) */}
             {!currentVariant && product.regularPrice && product.regularPrice > displayPrice && (
                <span className="text-sm text-gray-500 line-through mb-1">
                    {formatPrice(product.regularPrice)}
                </span>
            )}
        </div>
      </div>

      {/* 3. Options (Dynamic) */}
      <div className="space-y-4">
        <ProductVouchers vouchers={vouchers} />

        {/* Loop qua các Tiers - [FIX] Check null an toàn */}
        {product.tiers && product.tiers.length > 0 && product.tiers.map((tier, idx) => (
            <VariantSelector
                key={idx}
                tier={tier}
                selectedIndex={selections[idx]} // Giá trị selection từ state
                onSelect={(optionIdx) => handleSelectOption(idx, optionIdx)}
            />
        ))}

        {/* Quantity */}
        <div className="flex items-center gap-6 pt-2">
             <label className="text-sm font-semibold text-gray-900">Số lượng</label>
             <div className="flex items-center gap-4">
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
                <span className="text-sm text-gray-500">
                    {displayStock > 0 
                        ? `${displayStock} sản phẩm có sẵn` 
                        : "Hết hàng"}
                </span>
             </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3 h-12">
            <Button 
                variant="secondary" 
                className="flex-1 text-brand-orange bg-orange-50 border-brand-orange border hover:bg-orange-100 font-bold transition-all disabled:opacity-70"
                onClick={handleAddToCart}
                disabled={isAddingCart || displayStock === 0}
            >
                {isAddingCart ? (
                    <div className="flex items-center gap-2">
                         <span className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></span>
                         <span>Đang thêm...</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        <i className="fas fa-cart-plus"></i>
                        Thêm vào giỏ
                    </div>
                )}
            </Button>

            <Button 
                variant="primary" 
                className="flex-1 bg-gradient-to-r from-brand-orange to-red-500 hover:to-red-600 text-white shadow-lg shadow-orange-200 font-bold transform transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleBuyNow}
                disabled={displayStock === 0}
            >
                {displayStock === 0 ? "Hết hàng" : "Mua Ngay"}
            </Button>
        </div>

        {/* Nút Tặng Ngay */}
        <Button 
            variant="ghost" 
            className="w-full h-11 border border-dashed border-orange-300 text-orange-400 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            onClick={handleGiftNow}
            disabled={isGifting || displayStock === 0}
        >
            {isGifting ? "Đang xử lý..." : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    Tặng người thân
                </>
            )}
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
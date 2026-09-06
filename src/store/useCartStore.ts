// src/store/useCartStore.ts
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage } from 'zustand/middleware'; // [UPDATE] Import persist
import { apiClient } from '@/lib/api/ApiClient';
import { CartItem } from '@/types/cart';
import { toast } from 'react-hot-toast';
import { useUserStore } from './useUserStore';

interface AddToCartPayload {
  productId: number | string;
  productVariantId?: number | string;
  name?: string;
  title?: string;
  price: number | string;
  imageUrl?: string;
  shopId?: string;   
  shopName?: string;
  [key: string]: any;
}

interface CartState {
  items: CartItem[];
  selectedIds: string[];
  totalItems: number;
  totalPrice: number;
  totalSelectedPrice: number;
  isLoading: boolean;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addToCart: (product: AddToCartPayload, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  // [NEW] Xóa nhiều item (dùng sau khi checkout thành công)
  removeMultipleItems: (itemIds: string[]) => Promise<void>; 
  clearCart: () => void;
  toggleItemSelection: (itemId: string) => void;
  toggleAllSelection: (isSelected: boolean) => void;
  toggleShopSelection: (itemIds: string[], isSelected: boolean) => void;
  // [NEW] Helper lấy items đang được chọn
  getSelectedItems: () => CartItem[]; 
}

const parsePrice = (price: number | string): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    return parseFloat(price.replace(/\./g, '').replace(/[^\d]/g, ''));
  }
  return 0;
};

const calculateSummary = (items: CartItem[], selectedIds: string[]) => {
  const totalItems = items.length;
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSelectedPrice = items
    .filter(item => selectedIds.includes(item.id))
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  return { totalItems, totalPrice, totalSelectedPrice };
};
const getShopInfo = (item: any) => {
  // Ưu tiên lấy trực tiếp
  if (item.shopId) return { id: item.shopId, name: item.shopName };
  
  // Nếu nằm trong product
  if (item.product?.shop) {
    return { 
      id: item.product.shop.id || item.product.shopId, 
      name: item.product.shop.name || item.product.shopName 
    };
  }
  
  // Nếu nằm trong product mà không có object shop (ít gặp)
  if (item.product?.shopId) {
    return { id: item.product.shopId, name: 'Cửa hàng' };
  }

  return { id: 'unknown-shop', name: 'Cửa hàng' };
};
const useCartStoreBase = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      totalItems: 0,
      totalPrice: 0,
      totalSelectedPrice: 0,
      isLoading: false,

      fetchCart: async () => {
        const isAuth = useUserStore.getState().isAuthenticated;
        if (!isAuth) return;

        try {
          set({ isLoading: true });
          const res = await apiClient.get('/store/cart');
          
          // [LOG ĐỂ DEBUG] Bạn hãy mở F12 xem cấu trúc res trả về gì
          console.log("API Cart Response:", res); 

          if (res && Array.isArray(res.items)) {
            const cleanItems = res.items.map((item: any) => {
              const shopInfo = getShopInfo(item);
              
              return {
                ...item,
                // Map lại các trường quan trọng nếu BE trả về tên khác
                id: item.id, 
                productId: item.productId || item.product?.id,
                title: item.title || item.product?.name || "Sản phẩm",
                imageUrl: item.imageUrl || item.product?.thumbnail || item.product?.images?.[0] || "",
                price: parsePrice(item.price || item.product?.price),
                stock: item.stock || item.product?.stock || 99,
                
                // [FIX QUAN TRỌNG] Gán shopId và shopName
                shopId: String(shopInfo.id), 
                shopName: shopInfo.name || "Cửa hàng",
              };
            });

            // ... (Phần tính toán selectedIds giữ nguyên)
            const currentSelected = get().selectedIds;
            const validSelected = currentSelected.filter(id => cleanItems.find((i: any) => i.id === id));
            
            set({ 
                items: cleanItems, 
                selectedIds: validSelected,
                ...calculateSummary(cleanItems, validSelected), 
                isLoading: false 
            });
          } else {
            set({ items: [], isLoading: false });
          }
        } catch (error: any) {
          console.error("Fetch cart error:", error);
          set({ isLoading: false });
        }
      },

      addToCart: async (product: AddToCartPayload, quantity: number) => {
        // ... (Logic cũ giữ nguyên)
        const isAuth = useUserStore.getState().isAuthenticated;
        if (!isAuth) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return; 
        }
        const prevItems = get().items;
        const pId = product.productId || product.id; 
        const tempId = `temp-${pId}-${Date.now()}`;
        const price = parsePrice(product.price);

        const existingItemIndex = prevItems.findIndex(i => 
          i.productId === pId && 
          i.productVariantId === product.productVariantId
        );

        let newItems = [...prevItems];
        let targetItemId = tempId;

        if (existingItemIndex > -1) {
          targetItemId = newItems[existingItemIndex].id;
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity
          };
        } else {
          const newItem: CartItem = {
            id: tempId,
            productId: pId,
            productVariantId: product.productVariantId,
            title: product.name || product.title || "Sản phẩm",
            imageUrl: product.imageUrl || "",
            price: price,
            quantity: quantity,
            stock: 999,
            shopId: product.shopId || product.shop?.id || "unknown-shop",
            shopName: product.shopName || product.shop?.name || "Cửa hàng",
          };
          newItems.push(newItem);
        }

        const newSelectedIds = [...new Set([...get().selectedIds, targetItemId])];
        set({ items: newItems, selectedIds: newSelectedIds, ...calculateSummary(newItems, newSelectedIds) });
        toast.success("Đã thêm vào giỏ hàng!");

        try {
          const res = await apiClient.post('/store/cart', {
            productId: pId,
            productVariantId: product.productVariantId,
            quantity: quantity,
          });
          if (!res.id) get().fetchCart();
        } catch (error) {
          console.error(error);
        }
      },

      updateQuantity: async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const prevItems = get().items;
        const newItems = prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        set({ items: newItems, ...calculateSummary(newItems, get().selectedIds) });

        // wiki 0108: PHẢI đồng bộ lên server. Trước đây chỗ này chỉ đổi state trong máy
        // và để lại ghi chú "Optional: debounce update to server here" — nên bấm "+" rồi
        // F5 là số lượng quay về cũ (`[2,2,2]` → `[1,2,2]`), và tệ hơn: ĐƠN HÀNG được
        // dựng từ giỏ trên server, tức là khách thấy một tổng tiền còn hệ thống tính
        // theo số lượng cũ.
        //
        // `PATCH /store/cart/:itemId` đã có sẵn ở BE và nhận số lượng TUYỆT ĐỐI (`hset`).
        // `item.id` là composite field `${productId}:${variantId}` — phải gửi nguyên nó,
        // giống `removeItem` (gửi productId sẽ không khớp field nào).
        try {
          await apiClient.patch(`/store/cart/${encodeURIComponent(itemId)}`, { quantity: newQuantity });
        } catch (e) {
          console.error(e);
          // Trả lại đúng trạng thái cũ để màn hình không nói dối về số lượng/tổng tiền.
          set({ items: prevItems, ...calculateSummary(prevItems, get().selectedIds) });
          toast.error('Không cập nhật được số lượng, vui lòng thử lại');
        }
      },

      toggleShopSelection: (itemIds, isSelected) => {
        const currentSelected = get().selectedIds;
        let newSelected = [...currentSelected];
        if (isSelected) {
            newSelected = [...new Set([...newSelected, ...itemIds])];
        } else {
            newSelected = newSelected.filter(id => !itemIds.includes(id));
        }
        set({ selectedIds: newSelected, ...calculateSummary(get().items, newSelected) });
      },

      removeItem: async (itemId) => {
        const prevItems = get().items;
        const newItems = prevItems.filter(item => item.id !== itemId);
        const newSelectedIds = get().selectedIds.filter(id => id !== itemId);

        set({ items: newItems, selectedIds: newSelectedIds, ...calculateSummary(newItems, newSelectedIds) });

        try {
            const item = prevItems.find(i => i.id === itemId);
            // [round15 FIX cart-variant] BE Redis hash field giờ là composite
            // `${productId}:${variantId}` và getCart trả về id = field đó. Phải gửi
            // item.id (composite) cho DELETE :itemId, KHÔNG gửi productId — gửi productId
            // sẽ không khớp field nào (xoá hụt) hoặc xoá nhầm toàn bộ variant của SP.
            if(item) await apiClient.delete(`/store/cart/${encodeURIComponent(item.id)}`);
            toast.success('Đã xoá sản phẩm khỏi giỏ hàng');
        } catch(e) {
            console.error(e);
            set({ items: prevItems, selectedIds: get().selectedIds, ...calculateSummary(prevItems, get().selectedIds) });
            toast.error('Xoá thất bại, vui lòng thử lại');
        }
      },

      // [NEW ACTION]
      removeMultipleItems: async (itemIds: string[]) => {
        if (!itemIds.length) return;
        const prevItems = get().items;
        // Chỉ giữ lại những item KHÔNG nằm trong danh sách itemIds cần xóa
        const newItems = prevItems.filter(item => !itemIds.includes(item.id));
        const newSelectedIds = get().selectedIds.filter(id => !itemIds.includes(id));

        set({ items: newItems, selectedIds: newSelectedIds, ...calculateSummary(newItems, newSelectedIds) });

        // wiki 0108: PHẢI xoá trên server, không chỉ trong máy.
        //
        // Ghi chú cũ ở đây là "BE thường tự xoá khi tạo Order thành công". Điều đó ĐÚNG
        // cho luồng thanh toán (`order.service` gọi `cartService.removeItem` cho từng món
        // đã mua), nhưng hàm này còn phục vụ nút **"Xoá mục đã chọn"** trong giỏ — ở đó
        // không có đơn hàng nào được tạo, nên không ai xoá hộ: món biến mất trên màn hình
        // rồi hiện lại nguyên vẹn sau khi tải lại trang.
        //
        // DELETE trên field đã biến mất là vô hại (Redis `hdel` trả 0), nên gọi lại sau
        // khi đặt hàng cũng không sao.
        const results = await Promise.allSettled(
          itemIds.map((id) => apiClient.delete(`/store/cart/${encodeURIComponent(id)}`))
        );

        // Có cái nào hỏng thì ĐỌC LẠI giỏ từ server thay vì đoán — thà hiện đúng sự thật
        // còn hơn để màn hình nói một đằng, server một nẻo.
        if (results.some((r) => r.status === 'rejected')) {
          toast.error('Một vài sản phẩm chưa xoá được, đang tải lại giỏ hàng…');
          await get().fetchCart();
        }
      },

      clearCart: () => set({ items: [], selectedIds: [], totalItems: 0, totalPrice: 0, totalSelectedPrice: 0 }),

      toggleItemSelection: (itemId) => {
        const currentSelected = get().selectedIds;
        const isSelected = currentSelected.includes(itemId);
        const newSelected = isSelected 
            ? currentSelected.filter(id => id !== itemId)
            : [...currentSelected, itemId];
        
        set({ selectedIds: newSelected, ...calculateSummary(get().items, newSelected) });
      },

      toggleAllSelection: (isSelected) => {
        const allIds = isSelected ? get().items.map(i => i.id) : [];
        set({ selectedIds: allIds, ...calculateSummary(get().items, allIds) });
      },

      // [NEW HELPER]
      getSelectedItems: () => {
        const { items, selectedIds } = get();
        return items.filter(item => selectedIds.includes(item.id));
      }
    }),
    {
      name: 'cart-storage', // Key lưu trong localStorage
      storage: createJSONStorage(() => localStorage), // Chỉ định dùng localStorage
      partialize: (state) => ({
        items: state.items,
        selectedIds: state.selectedIds,
        // Không lưu status loading
      }),
      // Sau khi hydrate từ localStorage, recompute totals — items/selectedIds
      // được persist riêng nên các trường tổng (totalPrice, totalItems, ...)
      // sẽ ở giá trị khởi tạo 0 nếu không tính lại tại đây.
      onRehydrateStorage: () => (state) => {
        if (state) {
          const summary = calculateSummary(state.items, state.selectedIds);
          state.totalItems = summary.totalItems;
          state.totalPrice = summary.totalPrice;
          state.totalSelectedPrice = summary.totalSelectedPrice;
        }
      },
    }
  )
);

export const useCartActions = () => {
    const state = useCartStoreBase();
    return {
        fetchCart: state.fetchCart,
        addToCart: state.addToCart,
        updateQuantity: state.updateQuantity,
        removeItem: state.removeItem,
        removeMultipleItems: state.removeMultipleItems, // Export action này
        clearCart: state.clearCart,
        toggleItemSelection: state.toggleItemSelection,
        toggleAllSelection: state.toggleAllSelection,
        toggleShopSelection: state.toggleShopSelection,
        getSelectedItems: state.getSelectedItems
    };
};
// ... (phần useCartData giữ nguyên)
export const useCartData = () => useCartStoreBase(useShallow((state) => ({
    items: state.items,
    selectedIds: state.selectedIds,
    totalPrice: state.totalPrice,
    totalSelectedPrice: state.totalSelectedPrice,
    isLoading: state.isLoading
})));

export const useCartStore = useCartStoreBase;
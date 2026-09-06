"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ChatBubbleLeftEllipsisIcon, 
  PlusIcon, 
  StarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ShoppingBagIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ArrowDownCircleIcon 
} from "@heroicons/react/24/outline";

// Import các component con
import DynamicShopRenderer from "./components/DynamicShopRenderer";
import ShopReviewsTab from "@/modules/shop/components/ShopReviewsTab"; 
import { ShopService } from "@/services/shop.service";
import ProductCard from "@/modules/product/components/ProductCard";

// --- 1. TYPES ---
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface Voucher {
  id: string;
  discount: string;
  minOrder: string;
  expiry: string;
  percentage: string;
}

// --- 2. SUB-COMPONENTS (Giao diện mới) ---

const ShopStatCard = ({ icon, label, value }: StatItemProps) => (
  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
    <div className="text-white/80 w-5 h-5">{icon}</div>
    <div className="flex flex-col leading-none">
      <span className="text-white font-bold text-sm">{value}</span>
      <span className="text-white/60 text-[11px] mt-1">{label}</span>
    </div>
  </div>
);

const VoucherCard = ({ voucher }: { voucher: Voucher }) => (
  <div className="relative flex w-[280px] h-[100px] bg-white border border-brand-orange/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all shrink-0 group">
    <div className="bg-brand-orange/5 w-2 border-r border-dashed border-brand-orange/30"></div>
    <div className="flex-1 flex flex-col justify-center px-3 py-2">
      <h4 className="text-brand-orange font-bold text-lg leading-tight">{voucher.discount}</h4>
      <p className="text-gray-500 text-xs mt-1">Đơn tối thiểu {voucher.minOrder}</p>
      <p className="text-[10px] text-gray-400 mt-1">HSD: {voucher.expiry}</p>
    </div>
    <div className="flex flex-col items-center justify-center pr-3">
      <button className="bg-brand-orange text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-orange-200 shadow-lg group-hover:bg-orange-600 transition-colors">
        Lưu
      </button>
    </div>
    {/* Họa tiết trang trí */}
    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-gray-50 rounded-full z-10"></div>
    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-gray-50 rounded-full z-10"></div>
  </div>
);

const ShopTabs = ({ activeTab, onChange }: { activeTab: string; onChange: (t: string) => void }) => {
  const tabs = [
    { id: "home", label: "Dạo" },
    { id: "all_products", label: "Tất cả sản phẩm" },
    { id: "collection", label: "Bộ sưu tập" },
    { id: "rating", label: "Đánh giá" },
    { id: "profile", label: "Hồ sơ Shop" },
  ];

  return (
    <div className="w-full bg-white sticky top-[70px] z-30 shadow-sm border-b border-gray-100">
      <div className="max-w-[1340px] mx-auto flex overflow-x-auto no-scrollbar gap-8 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-4 text-sm font-semibold transition-all text-center relative whitespace-nowrap
              ${activeTab === tab.id ? "text-brand-orange" : "text-gray-500 hover:text-brand-orange"}
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-orange rounded-t-full shadow-sm" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---

const ShopProfilePage = ({ shopData, shopId }: { shopData: any; shopId: string }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  
  const searchParams = useSearchParams();
  
  // Ref dùng để xác định vị trí phần sản phẩm
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const shopStats = [
    { icon: <ShoppingBagIcon />, label: "Sản phẩm", value: "2.4K" },
    { icon: <UserGroupIcon />, label: "Người theo dõi", value: "24.5K" },
    { icon: <StarIcon />, label: "Đánh giá", value: "4.9/5.0" },
    { icon: <ChatBubbleLeftEllipsisIcon />, label: "Tỉ lệ phản hồi", value: "98%" },
    { icon: <ClockIcon />, label: "Tham gia", value: "5 năm" },
  ];

  const vouchers: Voucher[] = [
    { id: "1", discount: "Giảm 10k", minOrder: "200k", expiry: "31.12.2025", percentage: "10%" },
    { id: "2", discount: "Giảm 50%", minOrder: "0đ", expiry: "31.12.2025", percentage: "50%" },
    { id: "3", discount: "Hoàn 15k Xu", minOrder: "150k", expiry: "31.12.2025", percentage: "15k" },
    { id: "4", discount: "Freeship Xtra", minOrder: "50k", expiry: "31.12.2025", percentage: "100%" },
  ];

  // --- LOGIC QUAN TRỌNG: SCROLL XUỐNG SẢN PHẨM ---
  const handleScrollToProducts = () => {
    // 1. Chuyển tab sang 'all_products' nếu chưa ở đó
    if (activeTab !== 'all_products') {
      setActiveTab('all_products');
    }

    // 2. Scroll xuống div có ref={productsSectionRef}
    // Dùng setTimeout để đảm bảo React đã render xong nội dung của Tab mới
    setTimeout(() => {
        if (productsSectionRef.current) {
            // Trừ đi chiều cao header sticky (khoảng 150px) để không bị che mất tiêu đề
            const headerOffset = 150; 
            const elementPosition = productsSectionRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
        }
    }, 100);
  };

  // Effect xử lý Redirect từ URL (dành cho trường hợp link từ trang khác tới có kèm ?tab=...)
  // hooks-fix wiki 0031: setActiveTab từ URL param — derived sync, legitimate
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tabParam);
      // Nếu có param tab, cũng tự động scroll xuống
      setTimeout(() => {
        const contentElement = document.getElementById("shop-main-content");
        if (contentElement) {
            contentElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  }, [searchParams]);

  // Fetch API...
  useEffect(() => {
    const fetchCategories = async () => {
      const data: any = await ShopService.getShopCategories(shopId);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [shopId]);

  useEffect(() => {
    if (activeTab === "all_products") {
      const fetchProducts = async () => {
        setIsLoading(true);
        const res: any = await ShopService.getShopProducts(shopId, filters);
        // [FIX wiki 0095/0099/0103] `if (res)` đã chặn được null, nhưng khoá đọc thì SAI:
        // BE `/shops/:id/products` trả `{ data, meta }` (xem shop.service.ts:113) — không có
        // khoá `items` → `res.items || []` LUÔN ra `[]`, tab "Tất cả sản phẩm" rỗng vĩnh viễn.
        // Chuẩn hoá theo cả hai shape để không phụ thuộc trí nhớ về client nào bọc `data`.
        const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        setProducts(Array.isArray(list) ? list : []);
        setIsLoading(false);
      };
      fetchProducts();
    }
  }, [shopId, filters, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* === SECTION 1: HEADER SHOP MỚI (MALL STYLE) === */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 pt-8 pb-4">
        {/* Background Image mờ */}
        <div className="absolute inset-0 z-0 opacity-30">
           <Image 
             src="/assets/shop-cover-bg.png" 
             alt="Cover" 
             fill 
             className="object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-[1340px] mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
            
            {/* BOX THÔNG TIN SHOP */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl flex gap-5 items-center lg:w-[420px] shadow-2xl">
              <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0">
                <div className="w-full h-full rounded-full border-4 border-white/90 overflow-hidden relative shadow-md">
                  <Image 
                    src="/assets/ImageAsset1.png" 
                    alt="Shop Avatar" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white flex items-center gap-1 shadow-sm">
                   <CheckBadgeIcon className="w-3 h-3" /> Mall
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <h1 className="text-xl font-bold text-white line-clamp-1 flex items-center gap-2">
                  ABC Shop Official
                  <span className="w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse" title="Online"></span>
                </h1>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" /> TP. Hồ Chí Minh
                </p>
                
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold uppercase rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 shadow-sm">
                    <PlusIcon className="w-4 h-4" /> Theo dõi
                  </button>
                  <button className="flex-1 px-3 py-1.5 bg-transparent border border-white/40 text-white text-xs font-bold uppercase rounded hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> Chat
                  </button>
                </div>
              </div>
            </div>

            {/* BOX THỐNG KÊ & NÚT XEM GIAN HÀNG */}
            <div className="flex-1 flex flex-col gap-4">
               {/* Chỉ số */}
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4 pb-1">
                  {shopStats.map((stat, idx) => (
                    <ShopStatCard key={idx} {...stat} />
                  ))}
               </div>
               
               {/* --- NÚT XEM GIAN HÀNG --- */}
               {/* Đây là nút bạn cần: Đang ở Shop Page -> Click -> Scroll xuống dưới */}
               <div className="flex justify-start lg:justify-end pb-1">
                  <button 
                    onClick={handleScrollToProducts} // Gọi hàm scroll
                    className="group flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm">Xem Gian Hàng</span>
                    {/* Icon mũi tên xuống để gợi ý hành động scroll */}
                    <ArrowDownCircleIcon className="w-5 h-5 opacity-70 group-hover:opacity-100 animate-bounce" />
                  </button>
               </div>
            </div>

          </div>
        </div>
      </div>

      <div id="shop-main-content">
        <ShopTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-6 min-h-[600px]">
           {/* TAB: TRANG CHỦ */}
           {activeTab === 'home' && (
               <DynamicShopRenderer decoration={shopData.decoration} shopId={shopId} />
           )}

           {/* TAB: ĐÁNH GIÁ */}
           {activeTab === 'rating' && (
              <div className="max-w-[1340px] mx-auto px-4">
                  <ShopReviewsTab shopId={shopId} />
              </div>
           )}

           {/* TAB: SẢN PHẨM / BỘ SƯU TẬP */}
           {['all_products', 'collection'].includes(activeTab) && (
              <div 
                ref={productsSectionRef} // Gắn Ref vào đây để hàm scroll tìm thấy vị trí này
                className="max-w-[1340px] mx-auto px-4 mt-6 flex flex-col gap-8 scroll-mt-[160px]"
              >
                {/* Voucher Section */}
                <div className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl border border-orange-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2">
                       <span className="w-1 h-6 bg-brand-orange rounded-full block"></span>
                       Mã giảm giá độc quyền
                     </h3>
                     <Link href="#" className="text-xs text-gray-500 hover:text-brand-orange flex items-center">
                        Xem tất cả <span className="ml-1 text-[10px]">❯</span>
                     </Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {vouchers.map((v) => (
                      <VoucherCard key={v.id} voucher={v} />
                    ))}
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between sticky top-[135px] z-20 bg-gray-50/95 backdrop-blur py-3">
                      <h3 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2">
                         {activeTab === 'all_products' ? 'Tất cả sản phẩm' : 'Bộ sưu tập'}
                         <span className="text-sm font-normal text-gray-500 normal-case ml-2">({products.length} sản phẩm)</span>
                      </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {products.length > 0 ? (
                        products.map((product) => (
                          <ProductCard 
                            key={product.id} 
                            data={product}
                            id={product.id}
                            title={product.name}
                            price={product.price}
                            image={product.image || product.images?.[0]}
                            discount={product.discount}
                            sold={product.sold}
                          />
                        ))
                      ) : (
                          // Mock Data
                          Array.from({ length: 12 }).map((_, i) => (
                            <ProductCard 
                                key={i}
                                id={`mock-product-${i}`} 
                                title="Áo thun nam nữ form rộng tay lỡ Unisex vải cotton khô thoáng"
                                price={159000}
                                image="/assets/product-placeholder.png"
                                discount="-50%"
                                sold="1.2k"
                                tag="Yêu thích"
                            />
                          ))
                      )}
                  </div>
                  
                  <div className="flex justify-center mt-8">
                     <button className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 hover:text-brand-orange transition-colors">
                        Xem thêm sản phẩm
                     </button>
                  </div>
                </div>
              </div>
           )}
       </div>
    </div>
  );
};

export default ShopProfilePage;
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ShopService } from "@/services/shop.service";
import ShopInfo from "@/modules/product-details/components/ShopInfo"; 
import ShopCategoryBlock from "@/modules/shop/components/ShopCategoryBlock";
import ShopFilterSidebar from "@/modules/shop/components/ShopFilterSidebar";
import ProductGrid from "@/modules/product/components/ProductGrid";
import DynamicShopRenderer from "@/modules/shop/components/DynamicShopRenderer"; 
import { Loader2, Search } from "lucide-react";

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params?.id as string;

  const [shopProfile, setShopProfile] = useState<any>(null);
  const [shopCategories, setShopCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  // State Filter cho phần "Tất cả sản phẩm" ở dưới cùng
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    categoryId: null as string | null,
    shopCategoryId: null as string | null,
    rating: null as number | null
  });
  
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // 1. Fetch thông tin Shop & Categories
  useEffect(() => {
    if (!shopId) return;

    const fetchShopInfo = async () => {
      try {
        const [profileRes, catRes] = await Promise.all([
          ShopService.getShopProfile(shopId).catch(err => null),
          ShopService.getShopCustomCategories(shopId).catch(err => []) 
        ]);

        if (profileRes) {
            const profileData = (profileRes as any)?.data ? (profileRes as any).data : profileRes;
            setShopProfile(profileData);
        }

        let categoriesData: any[] = [];
        if (Array.isArray(catRes)) {
            categoriesData = catRes;
        } else if ((catRes as any)?.data && Array.isArray((catRes as any).data)) {
            categoriesData = (catRes as any).data;
        }
        console.log("catRes ", catRes);
        setShopCategories(categoriesData);

      } catch (error) {
        console.error("Error fetching shop info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, [shopId]);

  // 2. Fetch "Tất cả sản phẩm" (Chạy độc lập với Decoration)
  const fetchProducts = useCallback(async () => {
    if (!shopId) return;

    setProductsLoading(true);
    try {
      const cleanFilters: any = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
      };
      
      if (filters.shopCategoryId) cleanFilters.shopCategoryId = filters.shopCategoryId;
      if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;
      if (filters.minPrice) cleanFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) cleanFilters.maxPrice = filters.maxPrice;
      if (filters.rating) cleanFilters.rating = filters.rating;

      const res: any = await ShopService.getShopProducts(shopId, cleanFilters);
      
      const rawProducts = res.data || [];
      const meta = res.meta || {};

      const mappedProducts = rawProducts.map((p: any) => ({
         id: p.id,
         title: p.name,
         imageUrl: p.thumbnail || (p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : "/placeholder.png"),
         regularPrice: p.price,
         originalPrice: p.originalPrice || null,
         smallTag: (p.originalPrice && p.price < p.originalPrice) ? `-${Math.round((1 - p.price/p.originalPrice) * 100)}%` : undefined,
         rating: p.rating || 0,
         salesCount: p.salesCount > 0 ? `Đã bán ${p.salesCount}` : "Mới đăng",
         location: p.origin || "Việt Nam",
         variant: "regular"
      }));

      setProducts(mappedProducts);
      setPagination({
          total: meta.total || 0,
          totalPages: meta.last_page || 1
      });

    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); 
    } finally {
      setProductsLoading(false);
    }
  }, [shopId, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    // Khi filter thay đổi, scroll xuống phần danh sách sản phẩm
    const element = document.getElementById('all-products-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSortChange = (sortVal: string) => {
    setFilters(prev => ({ ...prev, sort: sortVal, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
     setFilters(prev => ({ ...prev, page: newPage }));
     const element = document.getElementById('all-products-section');
     if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // --- RENDER ---
  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={40}/></div>;
  }

  if (!shopProfile) {
    return (
        <div className="container py-10 text-center">
            <h2 className="text-xl font-bold text-gray-700">Không tìm thấy Shop</h2>
            <button onClick={() => window.location.reload()} className="mt-4 text-blue-500 underline">Thử lại</button>
        </div>
    );
  }

  const safeShopInfo = {
      id: shopProfile.id || "",
      name: shopProfile.name || "Unknown Shop",
      avatarUrl: shopProfile.avatar || "",
      isOfficial: false,
      lastActive: "vừa xong",
      stats: {
          rating: Number(shopProfile.rating || 0),
          productsCount: Number(shopProfile.totalProducts || 0),
          responseRate: 98,
          joinedDate: shopProfile.createdAt ? new Date(shopProfile.createdAt).toLocaleDateString('vi-VN') : "N/A",
          followerCount: 120 
      }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-6">
        
        {/* === PHẦN 1: HEADER SHOP === */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
           <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex-1 w-full">
                  <ShopInfo shop={safeShopInfo} />
              </div>
              <div className="flex gap-8 px-8 py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 h-fit self-center shrink-0">
                  <div className="text-center">
                      <div className="text-xl font-bold text-gray-800">{shopProfile.totalProducts || 0}</div>
                      <div className="text-xs text-gray-500 uppercase">Sản phẩm</div>
                  </div>
                  <div className="text-center border-l pl-8 border-gray-200">
                      <div className="text-xl font-bold text-gray-800">{Number(shopProfile.rating || 0).toFixed(1)}</div>
                      <div className="text-xs text-gray-500 uppercase">Đánh giá</div>
                  </div>
              </div>
           </div>
        </div>

        {/* === PHẦN 2: DANH MỤC SHOP (Luôn hiển thị ở trên) === */}
        {shopCategories.length > 0 && (
            <div className="mb-8">
                <ShopCategoryBlock categories={shopCategories} />
            </div>
        )}

        {/* === PHẦN 3: SHOP DECORATION (Kẹp ở giữa) === */}
        {/* Render khối trang trí nếu Shop đã thiết lập */}
        {shopProfile.decoration && (
            <DynamicShopRenderer 
                decoration={shopProfile.decoration} 
                shopId={shopId}
            />
        )}

        {/* === PHẦN 4: TẤT CẢ SẢN PHẨM + BỘ LỌC (Luôn ở dưới cùng) === */}
        <div id="all-products-section" className="flex flex-col lg:flex-row gap-6 pt-4 border-t border-gray-200">
            
            {/* SIDEBAR BỘ LỌC */}
            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                    <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm flex items-center gap-2">
                        <Search size={16}/> Bộ lọc tìm kiếm
                    </h3>
                    <ShopFilterSidebar 
                      categories={shopCategories} 
                      onFilterChange={handleFilterChange} 
                      selectedCategoryId={filters.shopCategoryId}
                    />
                </div>
            </aside>

            {/* PRODUCT LIST */}
            <div className="flex-1">
                {/* Thanh sắp xếp */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                    <h2 className="font-bold text-gray-800 text-lg uppercase">Tất cả sản phẩm</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Sắp xếp:</span>
                        <select 
                            className="border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-brand-orange bg-white text-gray-700 cursor-pointer"
                            value={filters.sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price_asc">Giá: Thấp đến Cao</option>
                            <option value="price_desc">Giá: Cao đến Thấp</option>
                            <option value="sales">Bán chạy nhất</option>
                        </select>
                    </div>
                </div>

                {/* Grid Sản phẩm */}
                {productsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-72 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <ProductGrid products={products} />
                        
                        {/* Phân trang */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-10 gap-2">
                                <button 
                                    disabled={filters.page === 1}
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-colors"
                                >
                                    Trang trước
                                </button>
                                <span className="px-4 py-2 bg-brand-orange text-white rounded text-sm font-bold shadow-sm">
                                    {filters.page} / {pagination.totalPages}
                                </span>
                                <button 
                                    disabled={filters.page === pagination.totalPages}
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-colors"
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white p-16 rounded-lg text-center flex flex-col items-center justify-center border border-dashed border-gray-200">
                        <Search size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-gray-900 font-medium mb-1">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-500 text-sm mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.</p>
                        <button 
                            onClick={() => handleFilterChange({})} 
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm font-medium transition"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
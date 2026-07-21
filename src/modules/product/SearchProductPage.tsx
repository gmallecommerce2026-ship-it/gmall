'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/ApiClient';

// UI Components
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductSortBar from "@/modules/product/components/ProductSortBar";
import ProductFilterSidebar from "@/modules/product/components/ProductFilterSidebar";
import ProductGridCard from "@/modules/product/components/ProductGridCard";
import PromoBanner from "@/modules/product/components/PromoBanner";
import Pagination from "@/components/ui/Pagination";
import { CategoryService } from "@/services/category.service";
import { humanizeTag } from "@/lib/tag-data";
import { useProductFilters } from "@/hooks/useProductFilters"; // Đã thêm import hook này

interface SearchProductPageProps {
  initialCategorySlug?: string;
  initialKeyword?: string;
  initialTag?: string;
}

const PAGE_SIZE = 20;

const SearchProductPage: React.FC<SearchProductPageProps> = ({ 
    initialCategorySlug,
    initialKeyword,
    initialTag
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { updateFilter } = useProductFilters(); // Khởi tạo hook
  
  const categorySlug = initialCategorySlug || searchParams.get('categorySlug') || '';
  const tag = initialTag || searchParams.get('tag') || '';
  const query = initialKeyword || searchParams.get('q') || '';
  
  const sort = searchParams.get('sort') || 'newest'; 
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const rating = searchParams.get('rating');
  const locations = searchParams.get('locations');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // States cho Sidebar & Title
  const [categoryDisplayName, setCategoryDisplayName] = useState("");
  const [categoryFilterKeys, setCategoryFilterKeys] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [childCategories, setChildCategories] = useState<any[]>([]);

  // Logic lấy dữ liệu Category (Title, FilterKeys, Sidebar List)
  useEffect(() => {
    const fetchCategoryData = async () => {
        try {
            const tree = await CategoryService.getTree();

            // Nếu không có categorySlug trên URL -> Root level
            if (!categorySlug) {
                setCurrentCategory({ id: 'root', name: 'TẤT CẢ DANH MỤC', slug: '' });
                setChildCategories(Array.isArray(tree) ? tree : []);
                setCategoryDisplayName("");
                setCategoryFilterKeys([]);
                return;
            }

            // Nếu có categorySlug -> Tìm trong Tree
            const findCategoryBySlug = (items: any[], slug: string): any => {
                for (const item of items) {
                    if (item.slug === slug) return item;
                    if (item.children) {
                        const found = findCategoryBySlug(item.children, slug);
                        if (found) return found;
                    }
                }
                return null;
            };

            const cat = findCategoryBySlug(tree, categorySlug);
            
            if (cat) {
                setCategoryDisplayName(cat.name);
                setCurrentCategory({ id: cat.id, name: cat.name, slug: cat.slug });
                setChildCategories(cat.children || []);
                
                // Parse filterKeys
                let fk: any[] = [];
                try {
                    fk = typeof cat.filterKeys === 'string' ? JSON.parse(cat.filterKeys) : (Array.isArray(cat.filterKeys) ? cat.filterKeys : []);
                } catch { fk = []; }
                setCategoryFilterKeys(fk);
            } else {
                // Fallback nếu không tìm thấy
                const fallbackName = categorySlug.split('-')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                setCategoryDisplayName(fallbackName);
                setCurrentCategory(null);
                setChildCategories([]);
                setCategoryFilterKeys([]);
            }
        } catch (e) {
            console.error("Lỗi fetch categories:", e);
        }
    };
    fetchCategoryData();
  }, [categorySlug]);

  // Xử lý khi user chọn một category con trong Sidebar
  const handleCategoryChange = useCallback((categoryId: string) => {
    const selectedCat = childCategories.find((c) => c.id === categoryId);
    if (selectedCat && selectedCat.slug) {
      updateFilter({ categorySlug: selectedCat.slug } as any);
    }
  }, [childCategories, updateFilter]);

  // Breadcrumbs logic
  const breadcrumbItems = useMemo(() => {
    const items = [{ name: "Trang chủ", href: "/" }];
    if (categorySlug) {
        const fallback = (categorySlug || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        items.push({ name: categoryDisplayName || fallback, href: "#" });
    } else {
        if (tag) items.push({ name: humanizeTag(tag), href: "#" });
        if (query) items.push({ name: `Tìm: "${query}"`, href: "#" });
    }
    return items;
  }, [query, tag, categorySlug, categoryDisplayName]);

  // Handle Page Change
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  }, [searchParams, pathname, router]);

  // Fetch Products Logic
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          limit: PAGE_SIZE,
          page: page,
          sort: sort,
        };

        if (query) params.search = query;
        if (tag) params.tag = tag;
        if (categorySlug) params.categorySlug = categorySlug;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (rating) params.rating = rating;
        if (locations) params.locations = locations; 

        const res: any = await apiClient.get('/store/products', { params });

        if (res) {
          const productList = Array.isArray(res.data) ? res.data : [];
          setProducts(productList);
          const totalCount = res.meta?.total || res.total || 0;
          setTotal(Number(totalCount));
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, page, tag, minPrice, maxPrice, rating, locations, categorySlug]);

  const pageTitle = categorySlug 
    ? `DANH MỤC: ${categoryDisplayName?.toUpperCase() || ''}`
    : (tag 
        ? `TAG: ${tag.toUpperCase()}` 
        : (query 
            ? `TÌM KIẾM: "${query.split(',').join(' + ').toUpperCase()}"` 
            : "TẤT CẢ SẢN PHẨM"
          )
      );

  return (
    <div className="flex flex-col items-center w-full bg-[#F5F5F5] min-h-screen font-sans pb-12">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-6"><PromoBanner /></div>
        <ProductSortBar title={pageTitle} />

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="w-full lg:w-[250px] flex-shrink-0 hidden lg:block">
            {/* ĐÃ CẬP NHẬT: Truyền đầy đủ props cho Sidebar */}
            <ProductFilterSidebar 
              dynamicFilters={categoryFilterKeys} 
              currentCategory={currentCategory}
              childCategories={childCategories}
              selectedCategoryId={null} 
              onCategoryChange={handleCategoryChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => <div key={i} className="bg-white rounded h-[300px] animate-pulse" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded shadow-sm">
                 <div className="relative w-40 h-40 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-box-open text-4xl text-gray-300"></i>
                 </div>
                 <h3 className="text-lg font-medium text-gray-800">Không tìm thấy sản phẩm</h3>
                 <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-3">
                  {products.map((product, index) => (
                      <ProductGridCard 
                        key={`${product.id}-${index}`} 
                        {...{
                          id: String(product.id),
                          imageUrl: product.images?.[0] || product.thumbnail || "/placeholder.png",
                          title: product.name || "Sản phẩm",
                          price: product.price, 
                          regularPrice: product.originalPrice || product.price,
                          originalPrice: product.originalPrice,
                          isDiscountActive: product.isDiscountActive,
                          discountType: product.discountType,
                          discountValue: product.discountValue,
                          salesCount: `Đã bán ${product.salesCount || 0}`,
                          rating: product.rating || 5,
                          location: product.location || "TP. HCM",
                          product: product,
                          variant: "regular"
                        }} 
                      />
                  ))}
                </div>
                
                <div className="mt-8 flex flex-col items-center gap-2">
                    <Pagination 
                        currentPage={page}
                        totalCount={total}
                        pageSize={PAGE_SIZE}
                        onPageChange={handlePageChange}
                    />
                    <div className="text-sm text-gray-500">
                        Hiển thị {products.length} trên tổng số {total} kết quả
                    </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProductPage;
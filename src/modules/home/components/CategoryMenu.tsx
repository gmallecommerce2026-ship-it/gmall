"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/ApiClient";
import { getSearchUrl } from '@/lib/url-helper'; // [IMPORT MỚI]
import { 
  ShoppingBag, Laptop, Shirt, Home, Gift, 
  Smartphone, Watch, LayoutGrid 
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  children?: CategoryItem[];
}

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("điện thoại") || n.includes("công nghệ")) return <Smartphone className="w-5 h-5" />;
  if (n.includes("máy tính") || n.includes("laptop")) return <Laptop className="w-5 h-5" />;
  if (n.includes("thời trang") || n.includes("quần áo")) return <Shirt className="w-5 h-5" />;
  if (n.includes("nhà cửa") || n.includes("đời sống")) return <Home className="w-5 h-5" />;
  if (n.includes("quà tặng")) return <Gift className="w-5 h-5" />;
  if (n.includes("đồng hồ") || n.includes("phụ kiện")) return <Watch className="w-5 h-5" />;
  return <ShoppingBag className="w-5 h-5" />;
};

const CategoryCard = ({ item }: { item: CategoryItem }) => {
  // [FIX] Sử dụng slug từ item hoặc fallback an toàn
  const mainLink = getSearchUrl({ category: item.slug }); 
  const subCategories = item.children?.slice(0, 5) || [];

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-orange-200">
      <Link href={mainLink} className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shrink-0">
          {getCategoryIcon(item.name)}
        </div>
        <h3 className="font-bold text-gray-800 text-[15px] md:text-base leading-tight group-hover:text-orange-600 line-clamp-2">
          {item.name}
        </h3>
      </Link>

      <div className="flex flex-wrap gap-2 mt-auto">
        {subCategories.map((child, idx) => (
          <Link 
            key={idx}
            // [FIX] Sử dụng helper
            href={getSearchUrl({ category: child.slug })}
            className="px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-md hover:bg-orange-100 hover:text-orange-700 transition-colors truncate max-w-full border border-transparent hover:border-orange-200"
          >
            {child.name}
          </Link>
        ))}
        {item.children && item.children.length > 5 && (
           <Link href={mainLink} className="px-2 py-1 text-xs text-orange-500 hover:underline">
             + Xem thêm
           </Link>
        )}
      </div>
    </div>
  );
};

const CategoryMenu = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await apiClient.get('/categories');
        let data: CategoryItem[] = [];
        if (Array.isArray(res)) data = res;
        else if (res && Array.isArray(res.data)) data = res.data;
        setCategories(data.filter(c => c && c.name));
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return (
    <div className="w-full max-w-[1340px] mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
      </div>
    </div>
  );

  if (categories.length === 0) return null;

  return (
    <section className="bg-white w-full border-t border-b border-gray-100 py-8 mb-6">
      <div className="w-full max-w-[1340px] mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-tight">
            Danh Mục Nổi Bật
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id || cat.name} item={cat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;
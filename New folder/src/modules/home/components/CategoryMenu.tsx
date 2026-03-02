"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/ApiClient";

// --- HELPERS ---
const createSlug = (text: string) => {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
};

interface CategoryItem {
  id: string;
  name: string;
  children?: CategoryItem[];
}

const SubCategoryRow = ({ rawText }: { rawText: string }) => {
  if (!rawText) return null;
  // [FIX] Thêm check an toàn trước khi map
  const items = rawText.split("/").map((item) => item.trim());
  return (
    <div className="flex flex-wrap items-center gap-x-1 text-[13px] leading-snug text-gray-500">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-300 select-none">/</span>}
          <Link href={`/search?category=${createSlug(item)}`} className="text-gray-500 hover:text-brand-orange transition-colors hover:underline">
            {item}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
};

const CategoryColumn = ({ title, links }: { title: string; links: string[] }) => {
  // [FIX] Đảm bảo links luôn là mảng
  const safeLinks = Array.isArray(links) ? links : [];
  const titleSlug = createSlug(title);
  
  return (
    <div className="flex flex-col gap-3">
      <Link href={`/category/${titleSlug}`}>
        <h3 className="font-roboto text-[14px] text-gray-900 uppercase border-b border-gray-100 pb-2 hover:text-brand-orange transition-colors inline-block">
          {title}
        </h3>
      </Link>
      <div className="flex flex-col gap-2">
        {safeLinks.map((rowText, index) => (
          <SubCategoryRow key={index} rawText={rowText} />
        ))}
      </div>
    </div>
  );
};

const CategoryMenu = () => {
  const [categoryData, setCategoryData] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await apiClient.get('/categories');
        
        // [FIX QUAN TRỌNG] Xử lý cả 2 trường hợp response (Array hoặc Object có data)
        let categories: CategoryItem[] = [];
        if (Array.isArray(res)) {
          categories = res;
        } else if (res && Array.isArray(res.data)) {
          categories = res.data;
        }

        if (categories.length > 0) {
          const transformed: Record<string, string[]> = {};
          
          categories.forEach((cat) => {
            if (!cat || !cat.name) return; 

            // [FIX] Kiểm tra kỹ cat.children có phải mảng không
            if (Array.isArray(cat.children) && cat.children.length > 0) {
               const childNames = cat.children.map(c => c?.name || "").filter(n => n);
               
               const rows = [];
               for (let i = 0; i < childNames.length; i += 3) {
                  rows.push(childNames.slice(i, i + 3).join(" / "));
               }
               transformed[cat.name] = rows;
            } else {
               transformed[cat.name] = [];
            }
          });
          setCategoryData(transformed);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryKeys = Object.keys(categoryData);

  if (loading) return null;
  if (categoryKeys.length === 0) return null;

  return (
    <div className="bg-white w-full border-t border-gray-100 shadow-sm">
      <div className="w-full max-w-[1340px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
          {categoryKeys.map((key) => (
            <CategoryColumn 
              key={key} 
              title={key} 
              links={categoryData[key]} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
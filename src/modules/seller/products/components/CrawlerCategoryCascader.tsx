// src/modules/seller/products/components/CrawlerCategoryCascader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Loader2, Check } from 'lucide-react'; // Bỏ các icon thừa
import classNames from 'classnames';
import { api } from '@/services/api';

export interface CrawlerCategory {
  id: string;
  name: string;
  hasChildren?: boolean;
  children?: CrawlerCategory[];
  parentId?: string | null;
}

interface CrawlerCategoryCascaderProps {
  onSelect: (leafId: string, path: CrawlerCategory[]) => void;
}

export const CrawlerCategoryCascader: React.FC<CrawlerCategoryCascaderProps> = ({ onSelect }) => {
  const [cols, setCols] = useState<CrawlerCategory[][]>([]);
  const [selectedPath, setSelectedPath] = useState<CrawlerCategory[]>([]);
  const [loadingLevel, setLoadingLevel] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load (Root)
  useEffect(() => {
    fetchCategories(null, 0, []);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (scrollContainerRef.current && cols.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
           scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [cols]);

  // THÊM THAM SỐ currentPathToCheck VÀO ĐÂY ĐỂ TRÁNH LỖI ASYNC
  const fetchCategories = async (parentId: string | null, level: number, currentPathToCheck: CrawlerCategory[]) => {
    try {
      setLoadingLevel(level);
      
      const params = parentId ? { parentId } : {}; 
      const responseBody = await api.get('/categories', { params });
      
      let items: CrawlerCategory[] = [];
      if (Array.isArray(responseBody)) items = responseBody;
      else if (responseBody?.data) items = responseBody.data;
      else if (responseBody?.items) items = responseBody.items;

      // Map data
      items = items.map(item => ({
        ...item,
        hasChildren: item.hasChildren ?? (item.children && item.children.length > 0) ?? true 
      }));

      if (items.length > 0) {
        // CASE 1: CÓ CON -> Render cột tiếp theo
        setCols(prev => {
          const newCols = [...prev].slice(0, level);
          newCols[level] = items;
          return newCols;
        });
      } else {
        // CASE 2: KHÔNG CÓ CON (LEAF) -> Trigger Select ngay
        // Cắt bớt các cột thừa phía sau nếu có
        setCols(prev => prev.slice(0, level));
        
        // SỬ DỤNG currentPathToCheck THAY VÌ selectedPath
        if (parentId && currentPathToCheck.length > 0) {
             const lastSelected = currentPathToCheck[currentPathToCheck.length - 1];
             
             // Check khớp ID để chắc chắn đây là danh mục vừa click
             if (lastSelected.id === parentId) {
                 console.log("Auto selecting leaf:", lastSelected.name);
                 onSelect(lastSelected.id, currentPathToCheck);
             }
        }
      }

    } catch (error: any) {
      console.error("API Error:", error);
    } finally {
      setLoadingLevel(null);
    }
  };

  const handleItemClick = async (category: CrawlerCategory, level: number) => {
    // 1. Tạo path mới ngay lập tức
    const newPath = [...selectedPath].slice(0, level);
    newPath.push(category);
    
    // 2. Update UI
    setSelectedPath(newPath);

    // 3. Gọi fetch và TRUYỀN newPath VÀO LUÔN (Fix bug ở đây)
    await fetchCategories(category.id, level + 1, newPath);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden relative shadow-inner">
      {/* Breadcrumbs */}
      <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide h-8">
         {selectedPath.length === 0 ? (
           <span className="text-xs text-gray-400 italic">Chọn danh mục...</span>
         ) : (
           selectedPath.map((cat, idx) => (
             <React.Fragment key={cat.id}>
               {idx > 0 && <ChevronRight size={10} className="text-gray-300" />}
               <span className={classNames("text-xs font-medium", idx === selectedPath.length - 1 ? "text-orange-600" : "text-gray-600")}>
                 {cat.name}
               </span>
             </React.Fragment>
           ))
         )}
      </div>

      {/* Columns Area */}
      <div className="flex-1 relative bg-gray-100/50 overflow-hidden">
        <div ref={scrollContainerRef} className="h-full flex overflow-x-auto p-2 gap-2 scroll-smooth scrollbar-hide snap-x">
          {cols.map((colItems, colIndex) => (
             <div key={colIndex} className="min-w-[180px] w-[180px] bg-white rounded border border-gray-200 flex flex-col h-full snap-start shadow-sm">
                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                    {colItems.map((cat) => {
                        const isSelected = selectedPath[colIndex]?.id === cat.id;
                        return (
                            <div key={cat.id} onClick={() => handleItemClick(cat, colIndex)}
                                className={classNames(
                                    "flex justify-between items-center px-2 py-1.5 mb-0.5 rounded cursor-pointer text-xs transition-colors select-none", 
                                    isSelected 
                                        ? "bg-orange-50 text-orange-700 font-bold" 
                                        : "hover:bg-gray-50 text-gray-700"
                                )}
                            >
                                <span className="truncate">{cat.name}</span>
                                {isSelected && <Check size={12} className="text-orange-500"/>}
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}

          {/* Loading */}
          {loadingLevel === cols.length && (
            <div className="min-w-[180px] h-full flex flex-col items-center justify-center bg-gray-50/50 rounded border border-dashed border-gray-300">
               <Loader2 className="animate-spin text-orange-500 mb-2" size={20} />
               <span className="text-[10px] text-gray-400">Đang tải...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
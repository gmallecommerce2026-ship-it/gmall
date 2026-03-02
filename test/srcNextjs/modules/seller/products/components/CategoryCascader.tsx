// src/modules/seller/products/components/CategoryCascader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Check, AlertCircle, ChevronLeft } from 'lucide-react';
import classNames from 'classnames';
import { api } from '@/services/api'; // Hoặc đường dẫn import api của bạn

// --- Types ---
interface Category {
  id: string;
  name: string;
  hasChildren: boolean; 
  parentId?: string | null;
}

interface CategoryCascaderProps {
  selectedId?: string; 
  onSelect: (leafId: string, path: Category[]) => void;
  onClose?: () => void;
  // [NEW] Prop tùy chọn: Cho phép chọn danh mục cha (cấp 1, 2, 3)
  allowSelectParent?: boolean; 
}

// Thêm default value cho allowSelectParent = false để không ảnh hưởng code cũ
export const CategoryCascader: React.FC<CategoryCascaderProps> = ({ 
  selectedId, 
  onSelect, 
  onClose,
  allowSelectParent = false 
}) => {
  // ... (Giữ nguyên toàn bộ State và useEffect cũ) ...
  // (Copy lại phần logic state: cols, selectedPath, loadingLevel, navigation...)
  
  // -- GIỮ NGUYÊN CÁC HÀM FETCH VÀ SCROLL --
  const [cols, setCols] = useState<Category[][]>([]);
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [loadingLevel, setLoadingLevel] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => { fetchCategories(null, 0); }, []);

  useEffect(() => {
    checkScroll();
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

  const fetchCategories = async (parentId: string | null, level: number) => {
    try {
      setLoadingLevel(level);
      const res: any = await api.get('/categories', { params: { parentId } }); // API của bạn
      const data = Array.isArray(res) ? res : res.data;
      if (Array.isArray(data) && data.length > 0) {
        setCols(prev => {
          const newCols = [...prev].slice(0, level);
          newCols[level] = data;
          return newCols;
        });
      } else {
        setCols(prev => prev.slice(0, level));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingLevel(null);
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleItemClick = async (category: Category, level: number) => {
    const newPath = [...selectedPath].slice(0, level);
    newPath.push(category);
    setSelectedPath(newPath);

    if (category.hasChildren) {
      await fetchCategories(category.id, level + 1);
    } else {
      setCols(prev => prev.slice(0, level + 1));
    }
  };

  // --- [MODIFIED] LOGIC XÁC NHẬN ---
  // Hợp lệ khi: Đã chọn ít nhất 1 cái VÀ (Là node lá HOẶC Chế độ cho phép chọn cha)
  const isValidSelection = selectedPath.length > 0 && (
    !selectedPath[selectedPath.length - 1].hasChildren || allowSelectParent
  );

  const handleConfirm = () => {
    if (!isValidSelection) return;
    const lastCat = selectedPath[selectedPath.length - 1];
    onSelect(lastCat.id, selectedPath);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 font-sans">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white z-20 flex justify-between items-center shrink-0">
        <div>
           <h3 className="font-bold text-gray-800 text-lg">Chọn Danh Mục</h3>
           {/* Đổi text hướng dẫn tùy theo mode */}
           <p className="text-xs text-gray-500 mt-0.5">
             {allowSelectParent ? 'Bạn có thể chọn bất kỳ cấp nào' : 'Vui lòng chọn cấp cuối cùng'}
           </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-6 py-3 bg-orange-50/50 border-b border-orange-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-inner shrink-0">
         <span className="text-xs font-bold text-orange-800 uppercase tracking-wide mr-2 flex-shrink-0">Đường dẫn:</span>
         {selectedPath.length === 0 ? (
           <span className="text-sm text-gray-400 italic">Chưa chọn...</span>
         ) : (
           selectedPath.map((cat, idx) => (
             <React.Fragment key={cat.id}>
               {idx > 0 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
               <button 
                 onClick={() => handleItemClick(cat, idx)}
                 className={classNames(
                   "text-sm px-2 py-0.5 rounded transition-all whitespace-nowrap", 
                   idx === selectedPath.length - 1 
                     ? "font-bold text-orange-600 bg-white shadow-sm ring-1 ring-orange-200" 
                     : "text-gray-600 hover:text-orange-600 hover:underline decoration-orange-300"
                 )}
               >
                 {cat.name}
               </button>
             </React.Fragment>
           ))
         )}
      </div>

      {/* Main Columns Area */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden group/container">
        {/* Buttons Nav Left/Right (Giữ nguyên) */}
        <button 
          onClick={() => scrollBy(-300)}
          className={classNames(
            "absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-orange-600 transition-all border border-gray-100",
            canScrollLeft ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => scrollBy(300)}
          className={classNames(
            "absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-orange-600 transition-all border border-gray-100",
            canScrollRight ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        >
          <ChevronRight size={20} />
        </button>

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="h-full flex overflow-x-auto overflow-y-hidden p-6 gap-4 scroll-smooth scrollbar-hide snap-x snap-mandatory"
        >
          {cols.map((colItems, colIndex) => (
             <div 
                key={colIndex} 
                className="min-w-[250px] w-[250px] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full snap-start"
             >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold text-gray-500 uppercase">Cấp {colIndex + 1}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {colItems.map((cat) => {
                        const isSelected = selectedPath[colIndex]?.id === cat.id;
                        return (
                            <div 
                                key={cat.id}
                                onClick={() => handleItemClick(cat, colIndex)}
                                className={classNames(
                                    "flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg text-sm cursor-pointer transition-all border border-transparent select-none",
                                    isSelected 
                                        ? "bg-orange-50 text-orange-700 font-semibold border-orange-100" 
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <span className="truncate pr-2">{cat.name}</span>
                                {cat.hasChildren ? (
                                    <ChevronRight size={16} className={classNames(isSelected ? "text-orange-500" : "text-gray-300")} />
                                ) : (
                                    isSelected && <Check size={16} className="text-orange-600" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}
          {/* Loading Indicator */}
          {loadingLevel === cols.length && (
            <div className="min-w-[250px] h-full flex items-center justify-center">
               <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="min-w-[20px]"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center z-20 shrink-0">
          <div className="text-sm text-gray-500 hidden sm:block">
             {isValidSelection ? (
               <span className="text-green-600 flex items-center gap-1"><Check size={14}/> Đã chọn xong</span>
             ) : (
               <span>Vui lòng chọn tiếp...</span>
             )}
          </div>
          <div className="flex gap-3">
             {onClose && (
               <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
             )}
             <button 
               onClick={handleConfirm}
               disabled={!isValidSelection}
               className={classNames(
                 "px-8 py-2 text-sm font-bold rounded-lg shadow-sm transition-all",
                 isValidSelection 
                   ? "bg-brand-orange text-white hover:bg-orange-600" 
                   : "bg-gray-100 text-gray-400 cursor-not-allowed"
               )}
             >
               Xác nhận
             </button>
          </div>
      </div>
    </div>
  );
};
'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/ApiClient';
import { FiCheck, FiChevronDown, FiChevronRight } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  children?: Category[]; 
}

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  singleSelect?: boolean;
}

export default function CategorySelector({ selectedIds, onChange, singleSelect = false }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [debugError, setDebugError] = useState<string | null>(null);

  // hooks-fix wiki 0031: setLoading(true) là sync flag cho UI loading; legitimate
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    console.log("⚡ [DEBUG] Bắt đầu gọi API /categories...");

    apiClient.get('/categories')
      .then((res: any) => {
        console.log("⚡ [DEBUG] Raw API Response:", res);
        console.log("⚡ [DEBUG] Type of res:", typeof res);
        console.log("⚡ [DEBUG] Is Array?", Array.isArray(res));

        // Logic xử lý dữ liệu mạnh tay hơn để bắt mọi trường hợp
        let finalData: Category[] = [];

        if (Array.isArray(res)) {
            finalData = res;
        } else if (res && Array.isArray(res.data)) {
            console.log("⚡ [DEBUG] Tìm thấy data nằm trong property .data");
            finalData = res.data;
        } else {
            console.warn("⚡ [DEBUG] Không nhận diện được format dữ liệu!");
            setDebugError("Format dữ liệu không đúng: " + JSON.stringify(res).slice(0, 100));
        }

        console.log("⚡ [DEBUG] Dữ liệu chốt để set state:", finalData);
        setCategories(finalData);
      })
      .catch((err) => {
        console.error("⚡ [DEBUG] API Error:", err);
        setDebugError(err.message || "Lỗi gọi API");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log("⚡ [DEBUG] Toggle Expand ID:", id);
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelect = (id: string) => {
    console.log("⚡ [DEBUG] Selected ID:", id);
    if (singleSelect) {
      onChange([id]);
    } else {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(cid => cid !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    }
  };

  const renderCategory = (cat: Category, level = 0) => {
    // Kiểm tra an toàn dữ liệu
    if (!cat || !cat.id) return null;

    const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
    const isExpanded = expandedIds.includes(cat.id);
    const isSelected = selectedIds.includes(cat.id);
    const paddingLeft = level * 20 + 8; 

    return (
      <div key={cat.id}>
        <div 
          onClick={() => {
             if (hasChildren) {
                 // Tự động mở/đóng nếu click vào dòng cha
                 const newExpanded = isExpanded 
                    ? expandedIds.filter(i => i !== cat.id) 
                    : [...expandedIds, cat.id];
                 setExpandedIds(newExpanded);
             } else {
                 handleSelect(cat.id);
             }
          }}
          className={`
            flex items-center justify-between p-2 cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-0
            ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}
          `}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <span 
                onClick={(e) => toggleExpand(e, cat.id)} 
                className="p-1 rounded hover:bg-gray-200 text-gray-500"
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            ) : (
                // Placeholder để căn thẳng hàng nếu không có con
                <span className="w-4"></span>
            )}
            <span>{cat.name}</span>
          </div>
          
          {isSelected && <FiCheck className="text-blue-600" />}
        </div>

        {/* Render con đệ quy */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 border-t border-gray-100">
            {cat.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // --- RENDERING CHÍNH ---

  if (loading) return <div className="text-sm text-gray-500 py-4 text-center">Đang tải danh mục...</div>;
  
  if (debugError) return <div className="text-sm text-red-500 p-2 border border-red-200 bg-red-50 rounded">Lỗi: {debugError}</div>;

  if (!categories || categories.length === 0) {
      return (
        <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded">
            Không có danh mục nào (State rỗng).
            <br/>
            <button 
                onClick={() => window.location.reload()} 
                className="text-blue-500 underline mt-2"
            >
                Tải lại trang
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-2">
        {/* VÙNG DEBUG TRÊN UI: Để bạn nhìn thấy ngay dữ liệu có vào hay không */}
        <div className="text-[10px] text-gray-400 bg-gray-100 p-2 rounded max-h-20 overflow-auto">
            DEBUG INFO: {categories.length} categories loaded.
            Top 1: {categories[0]?.name} (ID: {categories[0]?.id})
        </div>

        <div className="border rounded-lg bg-white overflow-hidden mt-2 max-h-[400px] overflow-y-auto custom-scrollbar shadow-sm">
        {categories.map(cat => renderCategory(cat))}
        </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ContentService, NavColumn } from '@/services/ContentService';
import { Check, ChevronDown, Tag, X } from 'lucide-react';
import classNames from 'classnames';

interface SystemTagSelectorProps {
  selectedTags: string[]; 
  onChange: (tags: string[]) => void;
}

interface TagOption {
  value: string;
  label: string;
  group: string;
  root: string;
}

// [FIX] 1. Hàm an toàn để chuyển mọi kiểu dữ liệu thành string
const safeString = (val: any): string => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    // Nếu là object (VD: đa ngôn ngữ), cố gắng lấy 1 trường hoặc stringify
    return val.vi || val.en || val.name || val.label || JSON.stringify(val);
  }
  return String(val);
};

// [FIX] 2. Hàm trích xuất value an toàn
const extractValue = (item: any) => {
    // Ưu tiên link, nếu không có thì lấy name, slug hoặc id
    const val = item.link || item.url || item.href || item.slug || item.id || item.name;
    return safeString(val);
};

export const SystemTagSelector = ({ selectedTags = [], onChange }: SystemTagSelectorProps) => {
  const [data, setData] = useState<NavColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const res = await ContentService.getSystemTagsConfig();
          // Kiểm tra nếu res không phải array thì gán mảng rỗng để tránh lỗi map
          setData(Array.isArray(res) ? res : []);
        } catch (error) {
          console.error("Lỗi tải System Tags:", error);
          setData([]);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
  }, []);

  // [FIX] 3. Xử lý làm phẳng dữ liệu với validate kỹ càng
  const flattenedOptions = useMemo<TagOption[]>(() => {
    if (!data || !Array.isArray(data)) return [];

    const options: TagOption[] = [];
    
    data.forEach(col => {
        // Đảm bảo col tồn tại
        if (!col) return;

        // Lấy root label an toàn
        const rawRoot = (col as any).systemLabel || col.label;
        const rootLabel = safeString(rawRoot) || 'Khác';
        
        const children = col.children || (col as any).items || [];
        
        if (Array.isArray(children)) {
            children.forEach(group => {
                if (!group) return;

                const groupLabel = safeString(group.label || group.title || 'Nhóm');
                const items = group.items || (group as any).links || [];

                if (Array.isArray(items)) {
                    items.forEach(item => {
                        if (!item) return;

                        // Chỉ push nếu item có giá trị hợp lệ
                        const val = extractValue(item);
                        const name = safeString(item.name || item.text || item.label);

                        if (val && name) {
                            options.push({
                                value: val,
                                label: name, // Đã safeString
                                group: groupLabel, // Đã safeString
                                root: rootLabel // Đã safeString
                            });
                        }
                    });
                }
            });
        }
    });
    return options;
  }, [data]);

  // Grouping options
  const groupedOptions = useMemo(() => {
    return flattenedOptions.reduce<Record<string, TagOption[]>>((acc, item) => {
        const key = item.root; 
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
  }, [flattenedOptions]);

  const toggleTag = (value: string) => {
    const newTags = selectedTags.includes(value)
      ? selectedTags.filter(t => t !== value)
      : [...selectedTags, value];
    onChange(newTags);
  };

  const selectedOptions = flattenedOptions.filter(opt => selectedTags.includes(opt.value));

  if (loading) return <div className="h-11 bg-gray-50 rounded-lg animate-pulse border border-gray-200"></div>;

  return (
    <div className="relative select-none">
      {/* Selected Tags Display */}
      {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedOptions.map(opt => (
                <span key={opt.value} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-md border border-orange-200 shadow-sm animate-in fade-in zoom-in duration-200">
                    {opt.label}
                    <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); toggleTag(opt.value); }} 
                        className="hover:bg-orange-200 rounded-full p-0.5 text-orange-600 transition-colors"
                    >
                        <X size={12} strokeWidth={3}/>
                    </button>
                </span>
            ))}
          </div>
      )}

      {/* Dropdown Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
            "w-full min-h-[44px] px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer bg-white transition-all duration-200",
            isOpen ? "border-orange-500 ring-4 ring-orange-500/10" : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center gap-2.5 text-gray-600 text-sm">
             <Tag size={18} className="text-gray-400" />
             <span className={classNames(selectedTags.length === 0 && "text-gray-400 font-normal")}>
                {selectedTags.length > 0 ? `Đã chọn ${selectedTags.length} thẻ phân loại` : 'Chọn thẻ phân loại (Không bắt buộc)'}
             </span>
        </div>
        <ChevronDown size={18} className={classNames("text-gray-400 transition-transform duration-300", isOpen ? "rotate-180 text-orange-500" : "")} />
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <>
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[450px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 italic flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Chọn các thẻ phù hợp để sản phẩm xuất hiện trong menu tìm kiếm.
                </p>
            </div>
            
            <div className="overflow-y-auto p-5 custom-scrollbar flex-1">
                {Object.entries(groupedOptions).length > 0 ? (
                    Object.entries(groupedOptions).map(([rootName, items]) => (
                        <div key={rootName} className="mb-8 last:mb-0">
                            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                                {rootName}
                            </h4>
                            
                            {/* Grid Items */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                {items.map((item) => {
                                    const isSelected = selectedTags.includes(item.value);
                                    return (
                                        <div 
                                            key={item.value}
                                            onClick={() => toggleTag(item.value)}
                                            className={classNames(
                                                "cursor-pointer px-3 py-2.5 rounded-lg text-sm border transition-all flex items-start justify-between group h-full select-none",
                                                isSelected 
                                                    ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm" 
                                                    : "bg-white border-gray-100 text-gray-600 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5"
                                            )}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-[13px] leading-tight">{item.label}</span>
                                                <span className="text-[10px] text-gray-400 group-hover:text-orange-500 transition-colors">{item.group}</span>
                                            </div>
                                            {isSelected ? (
                                                <Check size={16} className="text-orange-600 shrink-0 mt-0.5"/>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-gray-200 group-hover:border-orange-400 shrink-0 mt-0.5"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Tag size={40} strokeWidth={1} className="mb-2 opacity-20"/>
                        <p className="text-sm">Chưa có thẻ phân loại nào được cấu hình.</p>
                        <p className="text-xs mt-1">Vui lòng vào trang Admin &gt; Content để cấu hình.</p>
                    </div>
                )}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-xl">
                <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-200"
                >
                    Đóng
                </button>
            </div>
            </div>
            {/* Overlay click outside */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
};
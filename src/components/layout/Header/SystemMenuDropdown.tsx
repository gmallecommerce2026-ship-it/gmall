'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { ContentService, NavColumn } from '@/services/ContentService';

interface SystemMenuDropdownProps {
  configKey: string;
  label: string;
}

// Helper: Xử lý chuỗi an toàn
const safeString = (val: any): string => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return val.vi || val.vn || val.name || val.label || '';
  }
  return String(val);
};

// Sinh link cho một mục menu theo thứ tự ưu tiên: link tĩnh → keywords → tag tự động.
// Wiki 0104: bỏ toàn bộ console.group/log debug — chúng chạy cho MỌI mục menu trên
// MỌI lượt render ở production, đổ hàng chục dòng vào console của khách.
const getMenuLink = (item: any): string => {
    if (!item) return '/search';

    // 1. Link tĩnh
    if (item.link && typeof item.link === 'string' && item.link.trim() !== '' && !item.link.includes('undefined')) {
        return item.link.trim();
    }

    // 2. Keywords (Ưu tiên)
    let keywordString = '';
    if (Array.isArray(item.keywords)) {
        keywordString = item.keywords.join(',');
    } else if (typeof item.keywords === 'string') {
        keywordString = item.keywords;
    }

    if (keywordString && keywordString.trim().length > 0) {
        return `/search?q=${encodeURIComponent(keywordString.trim())}`;
    }

    // 3. Auto-Tag
    const autoTag = item.tagCode || item.code;
    if (autoTag && typeof autoTag === 'string' && autoTag.trim() !== '' && autoTag !== 'undefined') {
        return `/search?tag=${autoTag.trim()}`;
    }

    return '/search';
};

export const SystemMenuDropdown = ({ configKey, label }: SystemMenuDropdownProps) => {
  const [data, setData] = useState<NavColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        try {
            const res = await ContentService.getConfig(configKey);
            // Kiểm tra log dữ liệu trả về từ API
            console.log(`[SystemMenu] Config for ${configKey}:`, res);
            
            if (Array.isArray(res)) {
                setData(res);
            } else {
                setData([]);
            }
        } catch(e) { 
            console.error(`Lỗi menu ${label}:`, e);
            setData([]);
        } finally { 
            setLoading(false); 
        }
    };
    fetch();
  }, [configKey, label]);

  if (loading || !data || data.length === 0) return null;

  return (
    <div className="group relative px-3 py-2 cursor-pointer z-30">
       {/* Menu Label */}
       <div className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors uppercase select-none">
          {label}
          <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
       </div>

       {/* Dropdown Panel */}
       <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2">
           <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 min-w-[600px] grid grid-cols-1 md:grid-cols-3 gap-8">
               
               {data.map((column, colIdx) => {
                   if (!column) return null;
                   
                   return (
                       <div key={colIdx} className="flex flex-col gap-6">
                           {Array.isArray(column.children) && column.children.map((group, grpIdx) => {
                               if (!group) return null;
                               
                               return (
                                   <div key={grpIdx}>
                                       <h4 className="font-bold text-gray-900 text-[15px] mb-3 border-b border-gray-100 pb-1 inline-block">
                                           {safeString(group.label)}
                                       </h4>
                                       <ul className="space-y-2">
                                           {Array.isArray(group.items) && group.items.map((item: any, itmIdx) => {
                                               if (!item) return null;
                                               
                                               // Sử dụng hàm helper mới
                                               const href = getMenuLink(item);
                                               
                                               return (
                                                   <li key={itmIdx}>
                                                       <Link 
                                                          href={href} 
                                                          className="text-sm text-gray-500 hover:text-orange-600 hover:translate-x-1 transition-all block"
                                                       >
                                                          {safeString(item.name)}
                                                       </Link>
                                                   </li>
                                               );
                                           })}
                                       </ul>
                                   </div>
                               );
                           })}
                       </div>
                   );
               })}
           </div>
       </div>
    </div>
  );
};
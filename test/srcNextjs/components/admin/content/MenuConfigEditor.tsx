// file: src/components/admin/content/MenuConfigEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiTrash, FiSave, FiAlertCircle, 
  FiChevronDown, FiChevronRight, FiRefreshCw, FiTag, FiKey, FiHash
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { NavColumn, NavItem } from '@/services/ContentService';
import { apiClient } from '@/lib/api/ApiClient';

// Hàm tạo slug chuẩn SEO/Code
const generateSlug = (text: string, prefix: string = '') => {
    let slug = text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
    slug = slug.replace(/^_|_$/g, '');
    return prefix ? `${prefix}_${slug}` : slug;
};

interface MenuConfigEditorProps {
  initialData: NavColumn[];
  onSave: (data: NavColumn[]) => Promise<void>;
  loading: boolean;
  title: string;
}

export default function MenuConfigEditor({ initialData, onSave, loading, title }: MenuConfigEditorProps) {
  // Xác định prefix dựa trên Title của Config (VD: Menu Người Nhận -> recipient_)
  const getAutoPrefix = () => {
      const t = title.toLowerCase();
      if (t.includes('người nhận') || t.includes('đối tượng')) return 'recipient';
      if (t.includes('ngày lễ') || t.includes('dịp')) return 'occasion';
      if (t.includes('doanh nghiệp')) return 'corp';
      return 'tag';
  };

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<NavColumn[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const currentPrefix = getAutoPrefix();

  useEffect(() => {
    if (initialData) {
        setColumns(JSON.parse(JSON.stringify(initialData)));
    }
  }, [initialData]);

  const toggleExpand = (key: string) => {
    const newSet = new Set(expandedKeys);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setExpandedKeys(newSet);
  };

  // --- ACTIONS ---
  const updateState = (fn: (cols: NavColumn[]) => void) => {
    const newCols = JSON.parse(JSON.stringify(columns));
    fn(newCols);
    setColumns(newCols);
  };

  const addColumn = () => updateState(cols => cols.push({ label: 'Cột Mới', children: [] }));
  const removeColumn = (idx: number) => updateState(cols => cols.splice(idx, 1));
  const updateColumnLabel = (idx: number, val: string) => updateState(cols => cols[idx].label = val);

  const addGroup = (colIdx: number) => updateState(cols => {
     if (!cols[colIdx].children) cols[colIdx].children = [];
     cols[colIdx].children.push({ label: 'Nhóm Mới', items: [] });
     toggleExpand(`${colIdx}-${cols[colIdx].children.length - 1}`);
  });
  
  const removeGroup = (colIdx: number, grpIdx: number) => updateState(cols => cols[colIdx].children?.splice(grpIdx, 1));
  const updateGroupLabel = (colIdx: number, grpIdx: number, val: string) => updateState(cols => cols[colIdx].children[grpIdx].label = val);

  const addItem = (colIdx: number, grpIdx: number) => updateState(cols => {
     if (!cols[colIdx].children[grpIdx].items) cols[colIdx].children[grpIdx].items = [];
     cols[colIdx].children[grpIdx].items.push({ 
        name: '', 
        type: 'auto',
        code: '', 
        keywords: '' 
     });
  });
  
  const removeItem = (colIdx: number, grpIdx: number, itmIdx: number) => 
     updateState(cols => cols[colIdx].children[grpIdx].items?.splice(itmIdx, 1));

  const updateItem = (colIdx: number, grpIdx: number, itmIdx: number, field: keyof NavItem, value: string) => {
      updateState(cols => {
          const item = cols[colIdx].children[grpIdx].items[itmIdx];
          (item as any)[field] = value;
          
          // Tự động sinh Code khi nhập Tên (nếu Code đang trống hoặc chưa sửa tay)
          if (field === 'name') {
              const autoCode = generateSlug(value, currentPrefix);
              item.code = autoCode;
          }
      });
  };

  // Logic Lưu
  const handleSave = () => {
      const dataToSave: any = columns.map(col => ({
          ...col,
          children: (col.children || []).map(grp => ({
              ...grp,
              items: (grp.items || []).map(item => {
                  
                  // BƯỚC 1: Xác định Code/TagCode chuẩn
                  // Ưu tiên: item.code -> item.tagCode -> Tự sinh từ tên
                  let finalCode = item.code || (item as any).tagCode;
                  
                  if (!finalCode || finalCode.trim() === '') {
                      finalCode = generateSlug(item.name, currentPrefix);
                  }

                  // BƯỚC 2: Sinh Link từ Code đã có ở Bước 1
                  const finalLink = `/search?tag=${finalCode}`;

                  // BƯỚC 3: Trả về object đầy đủ các trường
                  return {
                      ...item,
                      type: 'auto', 
                      name: item.name,
                      
                      // Lưu cả 2 trường để tương thích mọi phiên bản API
                      code: finalCode,      
                      tagCode: finalCode,   
                      
                      link: finalLink,       // Link chắc chắn đúng
                      
                      keywords: item.keywords ? item.keywords.split(',').map(k => k.trim()).join(',') : ''
                  };
              })
          }))
      }));

      // Gọi prop onSave
      onSave(dataToSave);
  };

  // Logic gọi API quét Tag
  const handleScanProducts = async () => {
    if (!confirm(`Hệ thống sẽ quét toàn bộ sản phẩm và gắn tag "${currentPrefix}_...". Tiếp tục?`)) return;
    setIsScanning(true);
    const toastId = toast.loading('Đang xử lý Auto-Tag...');

    try {
        const rules: any[] = [];
        // Gom toàn bộ rules từ cấu hình hiện tại
        columns.forEach(col => {
            (col.children || []).forEach(group => {
                (group.items || []).forEach((item) => {
                    if (item.code && item.keywords) {
                        rules.push({
                            code: item.code,
                            keywords: item.keywords.split(',').map((k) => k.trim()).filter(Boolean)
                        });
                    }
                });
            });
        });

        if (rules.length === 0) throw new Error("Vui lòng nhập Từ khóa cho các mục để quét!");

        // Gọi API Backend
        const res = await apiClient.post('/admin/products/auto-tag/scan', { rules });
        toast.success(`Đã cập nhật tag cho ${res.updatedCount} sản phẩm!`, { id: toastId });
    } catch (error: any) {
        toast.error(error?.message || 'Lỗi quét sản phẩm', { id: toastId });
    } finally {
        setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full min-h-[600px]">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                {title}
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">Auto-Tag Mode</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Hệ thống tự động sinh Link và gắn Tag cho sản phẩm dựa trên từ khóa.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleScanProducts}
                disabled={isScanning || loading}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
                <FiRefreshCw className={isScanning ? 'animate-spin' : ''} />
                {isScanning ? 'Đang Quét...' : 'Chạy Quét Tag Ngay'}
            </button>
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-md transition-all text-sm">
                <FiSave /> Lưu Cấu Hình
            </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-x-auto p-6 bg-gray-100">
        <div className="flex gap-6 items-start">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="min-w-[320px] max-w-[320px] bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
                {/* Column Header */}
                <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-xl">
                     <span className="bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">CỘT {colIdx+1}</span>
                     <input 
                        value={col.label} 
                        onChange={(e) => updateColumnLabel(colIdx, e.target.value)}
                        className="flex-1 bg-transparent font-bold text-sm outline-none text-gray-700"
                        placeholder="Tiêu đề cột..."
                     />
                     <button onClick={() => removeColumn(colIdx)} className="text-gray-400 hover:text-red-500"><FiTrash/></button>
                </div>

                {/* Groups */}
                <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {(col.children || []).map((group, grpIdx) => {
                        const expandKey = `${colIdx}-${grpIdx}`;
                        const isExpanded = expandedKeys.has(expandKey);
                        return (
                        <div key={grpIdx} className="border border-gray-200 rounded-lg bg-white group/panel">
                            {/* Group Header */}
                            <div className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpand(expandKey)}>
                                {isExpanded ? <FiChevronDown className="text-gray-400"/> : <FiChevronRight className="text-gray-400"/>}
                                <input 
                                    value={group.label}
                                    onChange={(e) => updateGroupLabel(colIdx, grpIdx, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-transparent text-sm font-semibold flex-1 outline-none text-gray-700"
                                    placeholder="Tên nhóm (VD: Theo độ tuổi)"
                                />
                                <button onClick={(e) => {e.stopPropagation(); removeGroup(colIdx, grpIdx)}} className="opacity-0 group-hover/panel:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"><FiTrash size={14}/></button>
                            </div>

                            {/* Items List */}
                            {isExpanded && (
                                <div className="p-2 space-y-2 border-t border-gray-100 bg-gray-50/50">
                                    {(group.items || []).map((item, itmIdx) => (
                                        <div key={itmIdx} className="bg-white border border-gray-200 rounded p-3 shadow-sm relative group/item">
                                            <button 
                                                onClick={() => removeItem(colIdx, grpIdx, itmIdx)} 
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                            >
                                                <FiTrash size={12}/>
                                            </button>
                                            
                                            <div className="space-y-2.5">
                                                {/* Tên hiển thị */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 block">Tên hiển thị</label>
                                                    <input 
                                                        value={item.name}
                                                        onChange={(e) => updateItem(colIdx, grpIdx, itmIdx, 'name', e.target.value)}
                                                        className="w-full text-sm font-medium border-b border-gray-200 focus:border-blue-500 outline-none pb-0.5 bg-transparent"
                                                        placeholder="VD: Bạn gái"
                                                        autoFocus={!item.name}
                                                    />
                                                </div>

                                                {/* Grid: Code & Keywords */}
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="relative">
                                                        <div className="absolute top-1.5 left-2 text-gray-400"><FiKey size={10}/></div>
                                                        <input 
                                                            value={item.keywords || ''}
                                                            onChange={(e) => updateItem(colIdx, grpIdx, itmIdx, 'keywords', e.target.value)}
                                                            className="w-full text-xs pl-6 pr-2 py-1.5 bg-yellow-50/50 border border-yellow-200 rounded text-gray-700 focus:border-yellow-500 outline-none"
                                                            placeholder="Từ khóa: gái, nữ, yêu, nàng..."
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        <FiHash size={10} className="text-gray-400"/>
                                                        <code className="text-[10px] text-gray-500 font-mono flex-1 truncate">{item.code || '...'}</code>
                                                        <span className="text-[9px] text-gray-400 italic">Auto-generated</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addItem(colIdx, grpIdx)} className="w-full py-2 text-xs border border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-1 bg-white">
                                        <FiPlus/> Thêm Mục
                                    </button>
                                </div>
                            )}
                        </div>
                    )})}
                    <button onClick={() => addGroup(colIdx)} className="w-full py-2 text-xs font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded transition-colors">+ Thêm Nhóm Mới</button>
                </div>
              </div>
            ))}
            
            {/* Add Column Button */}
            <button onClick={addColumn} className="min-w-[50px] h-[50px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all bg-white hover:bg-blue-50">
                <FiPlus size={24}/>
            </button>
        </div>
      </div>
    </div>
  );
}
// src/components/admin/content/SmartTagSelector.tsx
import React, { useState } from 'react';
import { FiTag, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

export interface TagDefinition {
  code: string;
  label: string;
  keywords: string[];
}

interface SmartTagSelectorProps {
  value: string; // tagCode hiện tại
  onChange: (tagCode: string, tagName: string) => void;
  availableTags: TagDefinition[];
  onUpdateKeywords: (tagCode: string, newKeywords: string[]) => void;
}

export const SmartTagSelector: React.FC<SmartTagSelectorProps> = ({ 
  value, onChange, availableTags, onUpdateKeywords 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const selectedTag = availableTags.find(t => t.code === value);
  const [tempKeywords, setTempKeywords] = useState(selectedTag?.keywords.join(', ') || '');

  // Cập nhật tempKeywords khi chọn tag khác
  React.useEffect(() => {
    if (selectedTag) {
        setTempKeywords(selectedTag.keywords.join(', '));
    }
  }, [selectedTag]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const tag = availableTags.find(t => t.code === code);
    if (tag) {
      onChange(tag.code, tag.label);
    } else {
        onChange('', '');
    }
  };

  const saveKeywords = () => {
    if (selectedTag) {
        const keywordsArray = tempKeywords.split(',').map(s => s.trim()).filter(Boolean);
        onUpdateKeywords(selectedTag.code, keywordsArray);
        setIsEditing(false);
    }
  };

  // Group tags để hiển thị đẹp hơn trong Select
  const groupedTags = {
      'recipient': availableTags.filter(t => t.code.startsWith('recipient:')),
      'occasion': availableTags.filter(t => t.code.startsWith('occasion:')),
      'corporate': availableTags.filter(t => t.code.startsWith('corporate:')),
      'other': availableTags.filter(t => !t.code.includes(':')),
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
         <label className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1">
            <FiTag /> Loại sản phẩm (Tag)
         </label>
         {selectedTag && (
             <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 transition-colors"
             >
                <FiEdit2 size={10} /> {isEditing ? 'Đóng' : 'Sửa từ khóa'}
             </button>
         )}
      </div>

      {/* Dropdown chọn Tag */}
      <div className="relative">
        <select
            value={value || ''}
            onChange={handleSelect}
            className="w-full text-sm pl-2 pr-8 py-2 bg-orange-50 border border-orange-200 text-gray-800 rounded-md outline-none focus:ring-2 focus:ring-orange-300 appearance-none cursor-pointer transition-all hover:bg-orange-100 font-medium"
        >
            <option value="">-- Chọn danh mục sản phẩm --</option>
            {groupedTags.recipient.length > 0 && <optgroup label="Đối tượng">{groupedTags.recipient.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}</optgroup>}
            {groupedTags.occasion.length > 0 && <optgroup label="Dịp lễ & Sự kiện">{groupedTags.occasion.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}</optgroup>}
            {groupedTags.corporate.length > 0 && <optgroup label="Doanh nghiệp">{groupedTags.corporate.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}</optgroup>}
            {groupedTags.other.length > 0 && <optgroup label="Khác">{groupedTags.other.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}</optgroup>}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-orange-500">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {/* Editor Từ khóa */}
      {isEditing && selectedTag && (
        <div className="bg-white border border-blue-200 p-3 rounded-md shadow-sm animate-in fade-in zoom-in duration-200 mt-2">
            <label className="text-[10px] text-gray-400 block mb-1 font-semibold">
                Sản phẩm chứa từ khóa này sẽ được gắn tag (phân cách bằng dấu phẩy):
            </label>
            <textarea 
                value={tempKeywords}
                onChange={(e) => setTempKeywords(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded focus:border-blue-500 outline-none mb-2 font-mono text-gray-600"
                rows={3}
                placeholder="VD: sơ sinh, newborn, tã, bỉm..."
            />
            <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium">Hủy</button>
                <button onClick={saveKeywords} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 transition-colors font-medium shadow-sm">
                    <FiCheck /> Lưu từ khóa
                </button>
            </div>
        </div>
      )}
      
      {/* Hint Text */}
      {selectedTag && !isEditing && (
          <p className="text-[10px] text-gray-400 truncate mt-1">
             <span className="font-semibold">Keywords:</span> {selectedTag.keywords.join(', ')}
          </p>
      )}
    </div>
  );
};
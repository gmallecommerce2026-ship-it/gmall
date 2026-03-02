'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/ApiClient';
import { FiCheck } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
}

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategorySelector({ selectedIds, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy danh mục (giả sử có API này)
    apiClient.get('/categories').then(res => {
      setCategories(res.data); // data có thể là array hoặc { items: [] } tùy API
      setLoading(false);
    });
  }, []);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(cid => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Đang tải danh mục...</div>;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-semibold mb-3">Chọn danh mục áp dụng</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {categories.map(cat => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <div 
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`cursor-pointer p-2 rounded border flex items-center justify-between text-sm transition
                ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:border-blue-300'}
              `}
            >
              <span>{cat.name}</span>
              {isSelected && <FiCheck />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
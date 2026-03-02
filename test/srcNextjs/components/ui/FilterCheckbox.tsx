// Frontend/components/ui/FilterCheckbox.tsx
import React from "react";

interface FilterCheckboxProps {
  label: string;
  checked?: boolean;      
  onChange?: () => void;
  onClick?: () => void; // <--- THÊM DÒNG NÀY (Dấu ? nghĩa là không bắt buộc)
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ 
  label, 
  checked, 
  onChange 
}) => {
  return (
    <div 
      className="flex items-center gap-2 cursor-pointer py-1"
      onClick={onChange} // [FIX 2] Gắn sự kiện click
    >
      {/* Custom Checkbox UI */}
      <div className={`w-4 h-4 rounded border flex items-center justify-center
        ${checked ? 'bg-brand-orange border-brand-orange' : 'border-gray-300 bg-white'}
      `}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      
      <span className={`text-sm ${checked ? 'text-brand-orange font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
};

export default FilterCheckbox;
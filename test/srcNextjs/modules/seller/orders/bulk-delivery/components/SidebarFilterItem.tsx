// src/modules/seller/orders/bulk-delivery/components/SidebarFilterItem.tsx
import React from 'react';
import classNames from 'classnames';

interface SidebarFilterItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SidebarFilterItem: React.FC<SidebarFilterItemProps> = ({ 
  label, 
  isActive, 
  onClick,
  className 
}) => {
  return (
    <div
      onClick={onClick}
      className={classNames(
        "flex items-center px-4 py-3 cursor-pointer text-sm transition-all duration-200 rounded-lg",
        {
          "bg-orange-50 text-[#E78720] font-bold border-l-4 border-[#E78720]": isActive,
          "text-gray-700 hover:bg-gray-50 hover:text-[#E78720] font-light": !isActive,
        },
        className
      )}
    >
      <span className="truncate">{label}</span>
    </div>
  );
};
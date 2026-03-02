// src/modules/seller/orders/bulk-delivery/components/StatusCard.tsx
import React from 'react';
import classNames from 'classnames';

interface StatusCardProps {
  label: string;
  count?: number;
  isActive?: boolean;
  width?: string; // Hỗ trợ custom width nếu cần thiết kế đặc thù
}

export const StatusCard: React.FC<StatusCardProps> = ({ label, count = 0, isActive, width }) => {
  return (
    <div
      className={classNames(
        "flex flex-col justify-center items-center h-[58px] px-4 rounded-[56px] border cursor-pointer transition-all",
        {
          "border-[#E78720] bg-white text-[#E78720] shadow-sm": isActive,
          "border-gray-200 bg-white text-gray-600 hover:border-[#E78720] hover:text-[#E78720]": !isActive,
        }
      )}
      style={{ minWidth: width || 'fit-content' }}
    >
      <span className={classNames("text-lg whitespace-nowrap", isActive ? "font-medium" : "font-light")}>
        {label} {count > 0 && `(${count})`}
      </span>
    </div>
  );
};
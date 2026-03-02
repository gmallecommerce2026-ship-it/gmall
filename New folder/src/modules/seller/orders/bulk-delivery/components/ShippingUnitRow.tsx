// src/modules/seller/orders/bulk-delivery/components/ShippingUnitRow.tsx
import React from 'react';

interface ShippingUnitRowProps {
  unitName: string;
  col1Label: string;
  col2Label: string;
  col3Label: string;
}

export const ShippingUnitRow: React.FC<ShippingUnitRowProps> = ({ 
  unitName, col1Label, col2Label, col3Label 
}) => {
  return (
    <div className="flex flex-row items-center gap-6 w-full py-2">
      <div className="min-w-[160px] text-lg font-light text-gray-900">
        {unitName}
      </div>
      
      {/* Các box thông số */}
      {[col1Label, col2Label, col3Label].map((label, idx) => (
        <div 
          key={idx}
          className="flex-1 flex flex-col justify-center items-center h-[58px] bg-white rounded-[56px] border border-gray-200 px-4"
        >
          <span className="text-lg font-light text-gray-900 truncate" title={label}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};
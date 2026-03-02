// src/modules/seller/orders/components/OrderSubTabs.tsx
import React, { memo } from 'react';
import classNames from 'classnames';
import { SubFilter } from '../types';

interface OrderSubTabsProps {
  filters: SubFilter[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

const OrderSubTabs: React.FC<OrderSubTabsProps> = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="flex items-center gap-4 w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={classNames(
            "px-5 py-2 rounded-full border transition-all whitespace-nowrap text-sm font-medium",
            activeFilter === filter.id
              ? "bg-orange-50 border-[#E78720] text-[#E78720]"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default memo(OrderSubTabs);
// src/modules/seller/orders/components/OrderMainTabs.tsx
import React, { memo } from 'react';
import classNames from 'classnames';
import { MainTab } from '../types';

interface OrderMainTabsProps {
  tabs: MainTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const OrderMainTabs: React.FC<OrderMainTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-8 border-b border-gray-200 w-full px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={classNames(
            "pb-3 text-lg font-medium transition-all relative top-[1px] border-b-[3px] whitespace-nowrap",
            activeTab === tab.id
              ? "text-[#E78720] border-[#E78720]"
              : "text-gray-600 border-transparent hover:text-[#E78720] hover:border-gray-200"
          )}
        >
          {tab.label}
          {tab.count && <span className="ml-2 text-sm font-normal text-gray-400">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
};

export default memo(OrderMainTabs);
import React from 'react';

interface OrderStatusSummaryProps {
  title: string;
  value: string | number;
  growthRate?: number; // Ví dụ: 5.2
  isCurrency?: boolean;
}

const OrderStatusSummary: React.FC<OrderStatusSummaryProps> = ({ 
  title, 
  value, 
  growthRate = 0, 
  isCurrency = false 
}) => {
  const isPositive = growthRate >= 0;

  return (
    <div className="w-[300px] h-[136px] flex flex-col justify-center items-start gap-4 p-4 border-r border-gray-300 last:border-0 bg-white hover:bg-gray-50 transition-colors">
      <div className="text-base font-light text-gray-900 whitespace-nowrap">
        {title}
      </div>
      
      <div className="text-2xl font-normal text-gray-900">
        {isCurrency ? `₫${value}` : value}
      </div>
      
      <div className="flex flex-row items-center gap-4 text-sm font-light text-gray-600">
        <span>so với 30 ngày trước</span>
        <div className="flex items-center gap-1">
           {/* Icon mũi tên */}
           <span className={`transform ${isPositive ? '' : 'rotate-180'} text-xs`}>
             {isPositive ? '▲' : '▼'}
           </span>
           <span className={`${isPositive ? 'text-green-600' : 'text-red-500'}`}>
             {Math.abs(growthRate)}%
           </span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusSummary;
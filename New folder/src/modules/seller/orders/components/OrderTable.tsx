// src/modules/seller/orders/components/OrderTable.tsx
import React from 'react';

const COLUMNS = [
  { id: 'product', label: 'Sản phẩm', width: '30%' },
  { id: 'amount', label: 'Số tiền', width: '10%' },
  { id: 'reason', label: 'Lý do', width: '15%' },
  { id: 'solution', label: 'Phương án', width: '20%' },
  { id: 'status', label: 'Trạng thái', width: '10%' },
  { id: 'action', label: 'Thao tác', width: '15%', align: 'right' },
];

const OrderTable = () => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col mt-6 shadow-sm">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 flex items-center px-6 py-4 text-sm font-semibold text-gray-700">
        {COLUMNS.map((col: any) => (
          <div 
            key={col.id} 
            style={{ width: col.width }} 
            className={`flex ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Empty State (Placeholder for performance optimized list) */}
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        </div>
        <span className="text-gray-400 font-light">Không có đơn hàng nào khớp với bộ lọc</span>
      </div>
    </div>
  );
};

export default OrderTable;
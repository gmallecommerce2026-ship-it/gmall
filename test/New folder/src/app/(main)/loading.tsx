import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        {/* Spinner đơn giản */}
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    </div>
  );
}
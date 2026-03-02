import React from 'react';

export default function Loading() {
  return (
    <div className="w-full min-h-[500px] bg-gray-50 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
'use client';
import React from 'react';
import { ChevronRight, FileQuestion, Truck, CreditCard, RotateCcw } from 'lucide-react';

export default function HelpCenterPage() {
  const topics = [
      { icon: <Truck size={24} />, title: 'Vận chuyển & Giao nhận' },
      { icon: <CreditCard size={24} />, title: 'Thanh toán' },
      { icon: <RotateCcw size={24} />, title: 'Trả hàng & Hoàn tiền' },
      { icon: <FileQuestion size={24} />, title: 'Câu hỏi thường gặp' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Trung tâm trợ giúp</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
         {topics.map((t, i) => (
             <div key={i} className="p-4 border border-gray-200 rounded-xl hover:border-brand-orange hover:bg-orange-50 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center">
                 <div className="text-brand-orange">{t.icon}</div>
                 <span className="font-medium text-gray-700 text-sm">{t.title}</span>
             </div>
         ))}
      </div>

      <h3 className="font-bold text-gray-800 mb-4">Câu hỏi gần đây</h3>
      <div className="space-y-3">
         {[
             'Làm sao để tôi đổi địa chỉ nhận hàng?',
             'Tôi có thể hủy đơn hàng khi đã thanh toán không?',
             'Quy trình bảo hành sản phẩm như thế nào?'
         ].map((q, idx) => (
             <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                 <span className="text-sm text-gray-700">{q}</span>
                 <ChevronRight size={16} className="text-gray-400" />
             </div>
         ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-3">Vẫn chưa tìm thấy câu trả lời?</p>
          <button className="text-brand-orange font-bold hover:underline">Chat với nhân viên hỗ trợ</button>
      </div>
    </div>
  );
}
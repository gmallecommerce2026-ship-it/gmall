'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileQuestion, Truck, CreditCard, RotateCcw, MessageCircle, Phone } from 'lucide-react';

// #51 (wiki 0044/0045): wire Help Center.
// - Cards topic giờ link tới các trang policy/terms tương ứng (thay vì cursor stub).
// - Câu hỏi link tới `/seller-dashboard/help/policies` (cùng nguồn knowledge base).
// - Nút "Chat với nhân viên" -> /messages?role=admin (tận dụng module messages có sẵn).
// - Thêm card thông tin hotline làm fallback cho user không quen chat.
export default function HelpCenterPage() {
  const topics = [
      { icon: <Truck size={24} />, title: 'Vận chuyển & Giao nhận', href: '/seller-dashboard/help/policies#shipping' },
      { icon: <CreditCard size={24} />, title: 'Thanh toán', href: '/seller-dashboard/help/policies#payment' },
      { icon: <RotateCcw size={24} />, title: 'Trả hàng & Hoàn tiền', href: '/seller-dashboard/help/policies#refund' },
      { icon: <FileQuestion size={24} />, title: 'Câu hỏi thường gặp', href: '/seller-dashboard/help/policies#faq' },
  ];

  const faqs = [
      { q: 'Làm sao để tôi đổi địa chỉ nhận hàng?', href: '/user/address' },
      { q: 'Tôi có thể hủy đơn hàng khi đã thanh toán không?', href: '/user/purchase' },
      { q: 'Quy trình bảo hành sản phẩm như thế nào?', href: '/seller-dashboard/help/policies#warranty' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Trung tâm trợ giúp</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
         {topics.map((t, i) => (
             <Link key={i} href={t.href} className="p-4 border border-gray-200 rounded-xl hover:border-brand-orange hover:bg-orange-50 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center">
                 <div className="text-brand-orange">{t.icon}</div>
                 <span className="font-medium text-gray-700 text-sm">{t.title}</span>
             </Link>
         ))}
      </div>

      <h3 className="font-bold text-gray-800 mb-4">Câu hỏi gần đây</h3>
      <div className="space-y-3">
         {faqs.map((item, idx) => (
             <Link key={idx} href={item.href} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                 <span className="text-sm text-gray-700">{item.q}</span>
                 <ChevronRight size={16} className="text-gray-400" />
             </Link>
         ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/messages?role=admin" className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">
              <MessageCircle size={18}/> Chat với nhân viên
          </Link>
          <a href="tel:19001221" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-bold hover:border-brand-orange hover:text-brand-orange transition-colors">
              <Phone size={18}/> Hotline 1900 1221
          </a>
      </div>
    </div>
  );
}
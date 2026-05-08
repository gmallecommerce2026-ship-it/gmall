'use client';

import React from 'react';
import Link from 'next/link';
import { FiMonitor, FiSmartphone, FiPrinter, FiMessageCircle, FiPhoneCall, FiMail } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';

const FAQ_ITEMS = [
  {
    question: "Làm sao để đăng tải sản phẩm có tính năng 'Cá nhân hóa'?",
    answer: "Để bật tính năng cá nhân hóa (khắc tên, in ảnh), bạn vào phần 'Thêm sản phẩm' > Chọn loại sản phẩm 'Customizable'. Tại đây bạn có thể cấu hình các trường dữ liệu khách hàng cần nhập (Text, Hình ảnh, Lời chúc)."
  },
  {
    question: "Tại sao sản phẩm của tôi bị từ chối kiểm duyệt?",
    answer: "G-Mall có quy trình kiểm duyệt 3 lớp nghiêm ngặt. Lý do phổ biến: Hình ảnh mờ nhòe, mô tả không đúng thực tế, hoặc sản phẩm không đạt tiêu chuẩn quà tặng (bao bì sơ sài). Vui lòng xem kỹ lý do trong email thông báo."
  },
  {
    question: "Cách kết nối máy in nhiệt để in đơn hàng loạt?",
    answer: "Hệ thống hỗ trợ khổ giấy A6 và A7. Bạn cần cài đặt Driver máy in, sau đó vào Cài đặt vận chuyển > Cấu hình máy in để thiết lập khổ giấy mặc định."
  }
];

export default function TechSupportPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Trung tâm trợ giúp kỹ thuật</h1>
        <p className="text-gray-500 mt-2">Chúng tôi có thể giúp gì cho Shop của bạn hôm nay?</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center group cursor-pointer">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiMonitor size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quản lý gian hàng</h3>
            <p className="text-sm text-gray-500">Hướng dẫn đăng sản phẩm, trang trí shop và quản lý tồn kho.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center group cursor-pointer">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiPrinter size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Vận hành & In ấn</h3>
            <p className="text-sm text-gray-500">Xử lý đơn hàng, kết nối máy in và quy trình đóng gói chuẩn G-Mall.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center group cursor-pointer">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FiSmartphone size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ứng dụng Seller</h3>
            <p className="text-sm text-gray-500">Lỗi hiển thị trên app, thông báo và chat với khách hàng.</p>
        </div>
      </div>

      {/* FAQ & Contact Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Câu hỏi thường gặp</h2>
            <div className="space-y-4">
                {FAQ_ITEMS.map((item, index) => (
                    <details key={index} className="group bg-white rounded-lg border border-gray-200 open:ring-2 open:ring-orange-100">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 group-open:text-brand-orange">
                            {item.question}
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="border-t border-gray-100 p-4 text-gray-600 text-sm leading-relaxed">
                            {item.answer}
                        </div>
                    </details>
                ))}
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-sm text-orange-800 flex items-center gap-3">
                <span className="font-bold bg-white px-2 py-1 rounded text-xs border border-orange-200">TIP</span>
                Bạn có thể tham gia cộng đồng "G-Mall Sellers Group" trên Facebook để trao đổi kinh nghiệm.
            </div>
        </div>

        {/* Contact Channels */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Liên hệ trực tiếp</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
                
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FiMessageCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Live Chat</h4>
                        <p className="text-xs text-gray-500 mb-2">Phản hồi trung bình: 5 phút</p>
                        {/* #66: link tới trang messages — module chat đã có sẵn,
                            seller chọn admin trong contact list. Đỡ phải làm
                            widget chat embed riêng, tận dụng infra hiện có. */}
                        <Link href="/messages?role=admin" className="block">
                          <Button variant="outline" className="!py-2 !px-4 text-sm w-full">
                            Chat với Admin
                          </Button>
                        </Link>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <FiPhoneCall size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Hotline Kỹ thuật</h4>
                        <p className="text-xs text-gray-500 mb-2">8:00 - 22:00 (T2 - CN)</p>
                        <a href="tel:1900xxxx" className="text-lg font-bold text-gray-800 hover:text-brand-orange">1900 6868</a>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                        <FiMail size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Email hỗ trợ</h4>
                        <p className="text-xs text-gray-500 mb-2">Phản hồi trong 24h</p>
                        <a href={`mailto:${BRAND.email}`} className="text-sm font-medium text-blue-600 hover:underline">{BRAND.email}</a>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}
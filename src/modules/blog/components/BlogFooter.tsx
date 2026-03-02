'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Giả định bạn có các icon này trong src/icons hoặc dùng thư viện. 
// Nếu chưa có, bạn có thể thay bằng thẻ <span> hoặc text tạm thời.
import { Facebook, Youtube, Instagram } from 'lucide-react'; 

export const BlogFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 pt-12 pb-8 text-gray-700 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* CỘT 1: VỀ GMALL BLOG & SOCIAL */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
              Về Gmall Blog
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Gmall Blog là kênh thông tin chia sẻ kiến thức mua sắm, review sản phẩm uy tín và cập nhật các xu hướng đời sống mới nhất dành cho người tiêu dùng thông thái.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
                <Facebook size={16} fill="currentColor" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition">
                <Youtube size={16} fill="currentColor" />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center hover:opacity-90 transition">
                <Instagram size={16} />
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
               <h5 className="font-bold text-gray-900 text-sm mb-2">Chứng nhận uy tín</h5>
               <div className="flex gap-2">
                  {/* Ảnh giả lập bộ công thương */}
                  <div className="w-24 h-9 bg-gray-200 relative">
                     <Image src="https://picsum.photos/100/36" alt="Bo Cong Thuong" fill className="object-contain mix-blend-multiply" />
                  </div>
               </div>
            </div>
          </div>

          {/* CỘT 2: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                Hotline: <Link href="tel:19006035" className="font-bold text-blue-600 hover:underline">1900 6035</Link> 
                <span className="text-xs text-gray-400 ml-1">(1000đ/phút)</span>
              </li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Các câu hỏi thường gặp</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Gửi yêu cầu hỗ trợ</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Hướng dẫn đặt hàng</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Phương thức vận chuyển</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Chính sách đổi trả</Link></li>
            </ul>
          </div>

          {/* CỘT 3: DANH MỤC NỔI BẬT */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
              Danh mục Blog
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Review Sách Hay</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Công Nghệ & Đời Sống</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Góc Nhìn & Phong Cách</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Tư Vấn Mẹ & Bé</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Kinh Nghiệm Du Lịch</Link></li>
              <li><Link href="#" className="hover:text-blue-600 hover:underline">Sức Khỏe & Làm Đẹp</Link></li>
            </ul>
          </div>

          {/* CỘT 4: TẢI ỨNG DỤNG (QR Code) */}
          <div>
             <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
              Tải ứng dụng Gmall
            </h4>
            <div className="flex gap-3">
               <div className="relative w-24 h-24 bg-white border border-gray-200 p-1 rounded shadow-sm">
                  {/* Thay thế bằng QR Code thật của bạn */}
                  <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gmall.vn" alt="QR Code" fill className="object-contain p-1" />
               </div>
               <div className="flex flex-col justify-between h-24">
                  <Link href="#" className="relative w-32 h-10 block">
                     <Image src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" fill className="object-contain" />
                  </Link>
                  <Link href="#" className="relative w-32 h-10 block">
                     <Image src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="App Store" fill className="object-contain" />
                  </Link>
               </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Trải nghiệm mua sắm tốt hơn trên ứng dụng Gmall Mobile App.</p>
          </div>
        </div>

        {/* BOTTOM BAR: COMPANY INFO */}
        <div className="border-t border-gray-100 pt-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                 <h5 className="font-bold text-gray-700 uppercase mb-2">Công ty TNHH Gmall Việt Nam</h5>
                 <p className="mb-1">Địa chỉ: Tòa nhà Gmall, 123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh</p>
                 <p className="mb-1">Giấy chứng nhận Đăng ký Kinh doanh số 0309532xxx do Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 01/01/2025</p>
              </div>
              <div className="lg:text-right">
                 <p className="mb-1">© 2026 - Bản quyền của Công ty TNHH Gmall Việt Nam</p>
                 <p>Email: <a href="mailto:support@gmall.vn" className="text-blue-600">support@gmall.vn</a></p>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
};
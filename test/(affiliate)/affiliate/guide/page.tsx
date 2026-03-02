'use client';
import React, { useState } from 'react';
import { Play, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Link as LinkIcon, Share2, BarChart2, DollarSign, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AffiliateGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-10">
      
      {/* 1. Hero Section & Video Tutorial */}
      <section className="text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Kiếm tiền & Làm từ thiện <br /> thật dễ dàng cùng chúng tôi
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Chỉ với 5 bước đơn giản, bạn có thể biến sức ảnh hưởng của mình thành thu nhập và đóng góp giá trị cho cộng đồng.
        </p>
        
        {/* Video Placeholder */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 pl-1">
                    <Play fill="currentColor" size={24}/>
                 </div>
              </div>
           </div>
           {/* Giả lập thumbnail video */}
           <div className="absolute bottom-6 left-6 text-white text-left">
              <p className="font-bold text-lg">Hướng dẫn nhập môn Affiliate</p>
              <p className="text-sm opacity-80">Thời lượng: 05:30</p>
           </div>
        </div>
      </section>

      {/* 2. Checklist 5 Bước (How it works) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle size={24}/></div>
           <h2 className="text-2xl font-bold text-gray-800">Lộ trình 5 bước thành công</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
           {/* Connecting Line (Desktop only) */}
           <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
           
           <StepCard 
             step="01" 
             title="Đăng ký" 
             desc="Kích hoạt tài khoản Affiliate chỉ với 1 cú click."
             icon={<CheckCircle className="text-green-500"/>}
           />
           <StepCard 
             step="02" 
             title="Tạo Link" 
             desc="Chọn sản phẩm yêu thích và tạo link tiếp thị riêng."
             icon={<LinkIcon className="text-blue-500"/>}
           />
           <StepCard 
             step="03" 
             title="Chia sẻ" 
             desc="Đăng bài review lên Facebook, TikTok hoặc gửi cho bạn bè."
             icon={<Share2 className="text-purple-500"/>}
           />
           <StepCard 
             step="04" 
             title="Theo dõi" 
             desc="Xem báo cáo click và đơn hàng real-time tại Dashboard."
             icon={<BarChart2 className="text-orange-500"/>}
           />
           <StepCard 
             step="05" 
             title="Nhận tiền" 
             desc="Rút hoa hồng về ngân hàng hoặc quyên góp từ thiện."
             icon={<DollarSign className="text-red-500"/>}
           />
        </div>
        
        <div className="mt-8 text-center">
           <Link href="affiliate/links">
              <Button className="px-8">Bắt đầu tạo Link ngay</Button>
           </Link>
        </div>
      </section>

      {/* 3. FAQs Section */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-sm">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center p-3 bg-yellow-100 text-yellow-700 rounded-full mb-4">
              <HelpCircle size={24}/>
           </div>
           <h2 className="text-2xl font-bold text-gray-800">Câu hỏi thường gặp</h2>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
           <FaqItem 
              question="Chính sách hoa hồng được tính như thế nào?" 
              answer="Hoa hồng dao động từ 5% - 20% tùy thuộc vào ngành hàng và chiến dịch cụ thể. Bạn có thể xem chi tiết % hoa hồng tại trang Chi tiết sản phẩm hoặc trang Chiến dịch." 
           />
           <FaqItem 
              question="Khi nào tôi được nhận thanh toán?" 
              answer="Hệ thống sẽ đối soát vào ngày 25 hàng tháng. Số dư khả dụng tối thiểu để rút tiền là 200.000đ. Tiền sẽ về tài khoản ngân hàng của bạn trong vòng 3-5 ngày làm việc." 
           />
           <FaqItem 
              question="Đơn hàng bị hủy/đổi trả có được tính hoa hồng không?" 
              answer="Không. Hoa hồng chỉ được ghi nhận cho các đơn hàng ở trạng thái 'Thành công' và đã qua thời gian đổi trả (thường là 7 ngày sau khi nhận hàng)." 
           />
           <FaqItem 
              question="Cookie được lưu trong bao lâu?" 
              answer="Thời gian lưu cookie là 30 ngày. Nghĩa là nếu khách hàng click vào link của bạn hôm nay nhưng 29 ngày sau mới mua, bạn vẫn nhận được hoa hồng." 
           />
           <FaqItem 
              question="Làm thế nào để đóng góp từ thiện?" 
              answer="Bạn có thể cài đặt trích tự động % hoa hồng trong phần 'Hồ sơ' hoặc thực hiện quyên góp thủ công từng lần trong trang 'Ví tiền'." 
           />
        </div>
      </section>

      {/* 4. Support Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h3 className="text-xl font-bold mb-2">Bạn cần hỗ trợ thêm?</h3>
            <p className="text-primary-100">Đội ngũ hỗ trợ Affiliate của chúng tôi luôn sẵn sàng 24/7.</p>
         </div>
         <div className="flex gap-4">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 border-none">Chat với Admin</Button>
            <Button className="bg-white text-primary-700 hover:bg-gray-100">Gửi Email</Button>
         </div>
      </section>
    </div>
  );
}

// --- Sub Components ---

const StepCard = ({ step, title, desc, icon }: any) => (
  <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100 md:border-transparent md:bg-transparent hover:bg-white hover:shadow-lg transition-all z-10">
     <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-400 mb-3 shadow-sm">
        {step}
     </div>
     <div className="mb-2">{icon}</div>
     <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
     <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <div className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-primary-200">
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
         >
            <span className="font-medium text-gray-800">{question}</span>
            {isOpen ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
         </button>
         
         <div 
            className={`bg-gray-50 text-gray-600 text-sm overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 p-4 border-t border-gray-100' : 'max-h-0'}`}
         >
            {answer}
         </div>
      </div>
   );
}
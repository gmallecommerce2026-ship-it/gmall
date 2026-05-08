"use client";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@/icons';

export const IntroductionSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="mb-8 md:mb-10 border-b border-gray-100 pb-6 md:pb-8">
      <div className="max-w-4xl mx-auto text-center px-2">
        <h2 className="text-[16px] md:text-lg font-bold text-gray-800 mb-3 md:mb-4 uppercase tracking-wide">
          Về Chúng Tôi
        </h2>
        
        <div className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px]' : 'max-h-[100px] md:max-h-[110px]'}`}>
          <div className="text-gray-600 text-[13px] md:text-[14px] leading-7 md:leading-relaxed space-y-3 text-justify md:text-center">
            <p>
              Chào mừng bạn đến với <strong className="text-brand-orange">GMall</strong> – nền tảng mua sắm trực tuyến hàng đầu chuyên cung cấp các sản phẩm công nghệ và quà tặng độc đáo. Tại đây, chúng tôi không chỉ bán hàng, mà còn mang đến những giải pháp công nghệ tiên tiến nhất.
            </p>
            <p>
              Chúng tôi cam kết mang đến trải nghiệm mua sắm liền mạch, giao hàng nhanh chóng và dịch vụ chăm sóc khách hàng tận tâm 24/7. Với hệ thống tích điểm đổi quà hấp dẫn và hàng ngàn voucher giảm giá được tung ra mỗi ngày, chúng tôi hy vọng sẽ trở thành người bạn đồng hành tin cậy của bạn trên mọi hành trình mua sắm.
            </p>
            <p>
              Sứ mệnh của chúng tôi là kết nối mọi người thông qua những món quà ý nghĩa và công nghệ hiện đại, giúp cuộc sống trở nên tiện nghi, thú vị và tràn đầy niềm vui. Hãy cùng khám phá và tận hưởng không gian mua sắm tuyệt vời này ngay hôm nay!
            </p>
          </div>
          
          {/* Hiệu ứng mờ (Gradient Fade) đẹp hơn */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-orange/50 hover:bg-orange-50 transition-all duration-300"
          >
            <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-brand-orange">
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </span>
            <div className={`text-gray-400 group-hover:text-brand-orange transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
               {/* Dùng icon có sẵn của dự án, fallback sang SVG nếu cần */}
               {/* Kiểm tra component ChevronDownIcon trong dự án của bạn */}
               <ChevronDownIcon className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
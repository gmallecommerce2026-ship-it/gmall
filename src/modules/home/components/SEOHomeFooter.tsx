// src/modules/home/components/SEOHomeFooter.tsx
'use client'; // Quan trọng: Thêm dòng này vì chúng ta sẽ dùng useState

import React, { useState } from 'react';
import Link from 'next/link';
import IntroductionSection from './IntroductionSection';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Nếu bạn chưa có lucide-react, có thể dùng icon svg cũ

// --- DATA HARDCODED (Giữ nguyên dữ liệu của bạn) ---
const BRANDS = [
  "vascara", "dior", "esteelauder", "th truemilk", "barbie", "owen", 
  "ensure", "durex", "bioderma", "elly", "milo", "skechers", 
  "aldo", "triumph", "nutifood", "kindle", "nerman", "wacom", 
  "anessa", "yoosee", "olay", "similac", "comfort", "bitas", 
  "shiseido", "langfarm", "hukan", "vichy", "fila", "tsubaki"
];

const CATEGORIES = [
  {
    title: "Đồ Chơi - Mẹ & Bé",
    items: "Thời Trang Cho Mẹ Và Bé / Đồ chơi / Đồ dùng cho bé / Chăm sóc nhà cửa / Chăm sóc mẹ mang thai, sau sinh / Dinh dưỡng cho bé / Tã, Bỉm / Dinh dưỡng cho người lớn / Dinh dưỡng cho mẹ / Thực phẩm ăn dặm / Chuẩn bị mang thai"
  },
  {
    title: "Thực Phẩm Tươi Sống",
    items: "Trái Cây / Thịt, Trứng / Cá, thuỷ hải sản / Rau củ quả / Thực phẩm Việt / Sữa, bơ, phô mai / Đông lạnh, mát / Dầu ăn, gia vị / Gạo, mì, nông sản / Đồ hộp, đóng gói / Bia, đồ uống / Thực phẩm chay / Dành cho trẻ em / Bánh kẹo, giỏ quà / Thức ăn, đồ thú cưng / Chăm sóc cá nhân / Chăm sóc nhà cửa"
  },
  {
    title: "Điện Thoại - Máy Tính Bảng",
    items: "Điện thoại Smartphone / Điện thoại bàn / Điện thoại phổ thông / Máy đọc sách / Máy tính bảng"
  },
  {
    title: "Làm Đẹp - Sức Khỏe",
    items: "Chăm sóc da mặt / Dụng cụ làm đẹp / Thực phẩm chức năng / Trang điểm / Chăm sóc cơ thể / Máy Massage & Thiết bị chăm sóc sức khỏe / Sản phẩm thiên nhiên & Khác / Chăm sóc tóc và da đầu / Chăm sóc cá nhân / Nước hoa / Hỗ trợ tình dục / Bộ sản phẩm làm đẹp / Dược mỹ phẩm"
  },
  {
    title: "Điện Gia Dụng",
    items: "Đồ dùng nhà bếp / Thiết bị gia đình"
  },
  {
    title: "Thời trang nữ",
    items: "Áo nữ / Đầm nữ / Quần nữ / Áo liền quần - Bộ trang phục / Áo khoác nữ / Đồ ngủ - Đồ mặc nhà nữ / Chân váy / Trang phục bơi nữ / Thời trang bầu và sau sinh / Thời trang trung niên"
  },
  {
    title: "Thời trang nam",
    items: "Áo thun nam / Quần nam / Áo vest - Áo khoác nam / Áo sơ mi nam / Đồ lót nam / Áo hoodie nam / Đồ ngủ, đồ mặc nhà nam / Đồ đôi - Đồ gia đình nam / Áo nỉ - Áo len nam / Đồ bơi - Đồ đi biển nam / Quần áo nam trung niên / Quần áo nam kích cỡ lớn"
  },
  {
    title: "Giày - Dép nữ",
    items: "Giày cao gót / Dép - Guốc nữ / Giày thể thao nữ / Giày sandals nữ / Giày búp bê / Giày boots nữ / Giày lười nữ / Phụ kiện giày / Giày Đế xuồng nữ"
  },
  {
    title: "Giày - Dép nam",
    items: "Giày lười nam / Giày tây nam / Giày thể thao nam / Dép nam / Giày sandals nam / Phụ kiện giày nam / Giày boots nam"
  },
  {
    title: "Túi thời trang nữ",
    items: "Túi đeo chéo, túi đeo vai nữ / Ví nữ / Túi xách tay nữ / Túi tote nữ / Phụ kiện túi"
  },
  {
    title: "Túi thời trang nam",
    items: "Ví nam / Túi đeo chéo nam / Túi xách công sở nam / Túi bao tử, túi đeo bụng"
  },
  {
    title: "Balo và Vali",
    items: "Balo / Túi du lịch và phụ kiện / Balo, cặp, túi chống sốc laptop / Vali, phụ kiện vali"
  },
  {
    title: "Phụ kiện thời trang",
    items: "Phụ kiện thời trang nữ / Mắt kính / Phụ kiện thời trang nam"
  },
  {
    title: "Đồng hồ và Trang sức",
    items: "Trang sức / Đồng hồ nữ / Đồng hồ nam / Phụ kiện đồng hồ / Đồng hồ trẻ em"
  },
  {
    title: "Laptop - Máy Vi Tính - Linh kiện",
    items: "Linh Kiện Máy Tính - Phụ Kiện Máy Tính / Thiết Bị Văn Phòng - Thiết Bị Ngoại Vi / Thiết Bị Mạng / Thiết Bị Lưu Trữ / PC - Máy Tính Bộ / Laptop"
  },
  {
    title: "Nhà Cửa - Đời Sống",
    items: "Trang trí nhà cửa / Dụng cụ nhà bếp / Sửa chữa nhà cửa / Ngoài trời & sân vườn / Nội thất / Đèn & thiết bị chiếu sáng / Đồ dùng và thiết bị nhà tắm / Đồ dùng phòng ăn / Đồ dùng phòng ngủ / Đồ thờ cúng / Nhạc cụ / Hoa tươi và cây cảnh"
  },
  {
    title: "Bách Hóa Online",
    items: "Chăm sóc thú cưng / Đồ uống - Pha chế dạng bột / Thực phẩm Đóng hộp và Khô / Gia Vị và Chế Biến / Đậu & Hạt Các Loại / Đồ Ăn Vặt / Sữa và các Sản phẩm từ sữa / Đồ Uống Không Cồn / Đồ uống có cồn / Bộ quà tặng"
  },
  {
    title: "Hàng Quốc Tế",
    items: "Nhà Cửa - Đời Sống / Thời Trang / Ô tô, xe máy, xe đạp / Thiết Bị Số - Phụ Kiện Số / Thể thao - Dã ngoại / Làm Đẹp - Sức Khỏe / Sách, Văn phòng phẩm & Quà lưu niệm / Mẹ & Bé / Điện gia dụng / Bách hóa online / Máy Ảnh - Máy Quay Phim / Laptop & Máy Vi Tính / Sản phẩm - thiết bị công nghiệp / Tivi & Thiết Bị Nghe Nhìn / Điện Thoại - Máy Tính Bảng"
  },
  {
    title: "Thiết Bị Số - Phụ Kiện Số",
    items: "Phụ Kiện Điện Thoại và Máy Tính Bảng / Phụ kiện máy tính và Laptop / Thiết Bị Âm Thanh và Phụ Kiện / Thiết Bị Thông Minh và Linh Kiện Điện Tử / Thiết Bị Đeo Thông Minh và Phụ Kiện / Thiết Bị Chơi Game và Phụ Kiện"
  },
  {
    title: "Voucher - Dịch vụ",
    items: "Thanh toán hóa đơn / Khóa học / Du lịch - Khách sạn / Spa & Làm đẹp / Dịch vụ khác / Nhà hàng - Ăn uống / Sự kiện - Giải trí / Nha khoa - Sức khỏe / Phiếu quà tặng / Sim số - Thẻ cào - Thẻ game"
  },
  {
    title: "Ô Tô - Xe Máy - Xe Đạp",
    items: "Phụ kiện - Chăm sóc xe / Xe điện / Xe đạp / Xe máy / Ô tô / Xe Scooter / Dịch vụ, lắp đặt"
  },
  {
    title: "Nhà Sách Tiki",
    items: "Sách tiếng Việt / Văn phòng phẩm / Quà lưu niệm / English Books"
  },
  {
    title: "Điện Tử - Điện Lạnh",
    items: "Âm thanh & Phụ kiện Tivi / Phụ kiện điện lạnh / Tủ lạnh / Máy lạnh - Máy điều hòa / Máy giặt / Tủ đông - Tủ mát / Tivi / Máy nước nóng / Máy rửa chén / Máy sấy quần áo / Tủ ướp rượu"
  },
  {
    title: "Thể Thao - Dã Ngoại",
    items: "Trang phục thể thao nữ / Trang phục thể thao nam / Đồ dùng dã ngoại / Giày thể thao nam / Phụ kiện thể thao / Dụng cụ - thiết bị tập thể thao / Các môn thể thao khác / Dụng cụ câu cá / Thể thao dưới nước / Các môn thể thao đồng đội / Các môn thể thao chơi vợt / Các môn thể thao đối kháng  / Giày thể thao nữ / Thực phẩm bổ sung năng lượng / Dụng cụ leo núi"
  },
  {
    title: "Máy Ảnh - Máy Quay Phim",
    items: "Phụ Kiện Máy Ảnh, Máy Quay / Camera Giám Sát / Thiết Bị Ánh Sáng / Camera Hành Trình - Action Camera và Phụ Kiện / Balo - Túi Đựng - Bao Da / Ống Kính - Ống Ngắm / Ống Kính (Lens) / Thiết Bị Quay Phim / Máy Bay Camera và Phụ Kiện / Máy Ảnh"
  }
];

const KEYWORDS = [
  "máy sưởi", "đèn sưởi", "quạt tích điện sunhouse", "máy sấy tóc philips", 
  "bàn ủi hơi nước đứng", "bàn là hơi nước philip", "may sưởi xiaomi", 
  "bình nươc nóng ariston", "máy sưởi xiaomi", "máy hút bụi giường nệm", 
  "cây nước nóng lạnh toshiba", "robot hút bụi lau nhà của nhật", 
  "đèn sưởi âm trần", "nồi cơm điện tefal"
];

// --- COMPONENTS ---

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[14px] font-bold text-gray-800 uppercase mb-4 mt-8 border-b border-gray-100 pb-2">
    {children}
  </h4>
);

const SEOHomeFooter = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border-t border-gray-100 mt-10">
      <div className="container max-w-[1340px] mx-auto px-4 lg:px-6 py-10 font-roboto">
        
        {/* 0. GIỚI THIỆU */}
        <IntroductionSection />
        
        {/* 1. THƯƠNG HIỆU NỔI BẬT */}
        <SectionTitle>Thương Hiệu Nổi Bật</SectionTitle>
        <div className="flex flex-wrap gap-x-1 gap-y-2 items-center text-[13px] text-gray-500 leading-relaxed">
          {BRANDS.map((brand, idx) => (
            <React.Fragment key={idx}>
              {/* #36: query string là `q=`, KHÔNG phải `keyword=` (xem SearchProductPage). */}
              <Link href={`/search?q=${encodeURIComponent(brand)}`} className="hover:text-brand-orange hover:underline capitalize transition-colors">
                {brand}
              </Link>
              {idx < BRANDS.length - 1 && <span className="text-gray-300">/</span>}
            </React.Fragment>
          ))}
        </div>

        {/* 2. DANH MỤC SẢN PHẨM (ĐÃ NÂNG CẤP) */}
        <SectionTitle>Danh Mục Sản Phẩm</SectionTitle>
        
        <div className="relative">
          {/* Container kiểm soát chiều cao */}
          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isExpanded ? 'max-h-[3000px]' : 'max-h-[280px]'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6">
              {CATEGORIES.map((cat, idx) => {
                const subItems = cat.items.split('/').map(s => s.trim());
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    {/* Tiêu đề danh mục */}
                    <h5 className="font-bold text-gray-900 text-[13px] mb-1">{cat.title}</h5>
                    
                    {/* Danh sách item dạng Inline (Dòng chảy) */}
                    <div className="text-[12px] text-gray-500 leading-relaxed">
                      {subItems.map((item, subIdx) => (
                        <React.Fragment key={subIdx}>
                          <Link
                            href={`/search?q=${encodeURIComponent(item)}`}
                            className="hover:text-gray-900 hover:underline text-gray-500 transition-colors inline-block"
                          >
                            {item}
                          </Link>
                          {/* Dấu gạch chéo phân cách */}
                          {subIdx < subItems.length - 1 && (
                            <span className="text-gray-300 mx-1">/</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lớp phủ mờ (Gradient Mask) khi thu gọn */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Nút Xem Thêm / Thu Gọn */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-6 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-[13px] font-medium transition-all shadow-sm hover:shadow"
          >
            {isExpanded ? (
              <>
                Thu gọn <ChevronUp size={16} />
              </>
            ) : (
              <>
                Xem thêm <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>

        {/* 3. TỪ KHÓA ĐƯỢC QUAN TÂM */}
        <SectionTitle>Từ Khóa Được Quan Tâm</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {KEYWORDS.map((keyword, idx) => (
            <Link 
              key={idx} 
              href={`/search?keyword=${keyword}`} 
              className="px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-[12px] text-gray-600 hover:border-brand-orange hover:text-brand-orange hover:bg-orange-50 transition-all"
            >
              {keyword}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SEOHomeFooter;
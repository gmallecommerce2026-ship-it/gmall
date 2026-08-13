// src/components/layout/Footer.tsx
import React from "react";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { ContentService } from "@/services/ContentService";
import { normalizeCmsHref } from "@/lib/url-helper";

// --- DATA DEFINITION ---

// Cấu hình mặc định phòng trường hợp API lỗi hoặc chưa có data
const DEFAULT_FOOTER_LINKS = {
  about: {
    title: "Về chúng tôi",
    links: [
      { label: "Giới thiệu GMall", href: "/about" },
      { label: "Điều khoản dịch vụ", href: "/terms" },
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "Trung tâm trợ giúp", href: "/user/help" },
    ],
  },
  support: {
    title: "Hỗ trợ khách hàng",
    links: [
      { label: "Tài khoản của tôi", href: "/user/profile" },
      { label: "Đơn hàng của tôi", href: "/user/purchase" },
      { label: "Liên hệ qua chat", href: "/messages" },
      { label: "Bảo mật thông tin", href: "/privacy" },
    ],
  },
  policy: {
    title: "Chính sách & Quy định",
    links: [
      { label: "Điều khoản dịch vụ", href: "/terms" },
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "Trung tâm Affiliate", href: "/user/affiliate" },
      { label: "Tham gia bán hàng", href: "/seller/register" },
    ],
  },
};

const SOCIAL_ICONS = [
  { src: "/assets/ImageAsset132.png", alt: "Facebook", href: "https://www.facebook.com/gmall.vn" },
  { src: "/assets/ImageAsset131.png", alt: "Instagram", href: "https://www.instagram.com/gmall.vn" },
  { src: "/assets/ImageAsset130.png", alt: "Youtube", href: "https://www.youtube.com/@gmall.vn" },
  { src: "/assets/ImageAsset129.png", alt: "Tiktok", href: "https://www.tiktok.com/@gmall.vn" },
];

const PAYMENT_METHODS = [
  { src: "/assets/ImageAsset135.png", alt: "Visa", width: 50 },
  { src: "/assets/ImageAsset134.png", alt: "Mastercard", width: 38 },
  { src: "/assets/ImageAsset133.png", alt: "JCB", width: 34 },
  { src: "/assets/ImageAsset136.png", alt: "Momo", width: 22 },
  { src: "/assets/ImageAsset137.png", alt: "COD", width: 36 },
];

// --- COMPONENTS NHỎ ---
const FooterTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-bold text-gray-900 text-[14px] uppercase tracking-wide mb-5">
    {children}
  </h3>
);

// Wiki 0104: footer render THẲNG href do admin gõ trong CMS, nên dữ liệu bẩn ra
// thẳng production (đo được trên prod: `"/https://gmall.onrender.com/blog/..."` và
// nhiều link trỏ domain Render CŨ đã chết). Chuẩn hoá nằm ở `@/lib/url-helper` để
// dùng lại được cho mọi chỗ đọc đường dẫn từ CMS — và để có thể kiểm thử riêng.
const FooterLinkItem = ({ label, href }: { label: string; href: string }) => (
  <li>
    <Link
      href={normalizeCmsHref(href)}
      className="text-[13px] text-gray-500 hover:text-brand-orange hover:pl-1 transition-all duration-200 block py-1"
    >
      {label}
    </Link>
  </li>
);

// Chuyển Footer thành một Async Server Component để Fetch dữ liệu trực tiếp
const Footer = async () => {
  let footerLinks = DEFAULT_FOOTER_LINKS;

  // Lấy dữ liệu cấu hình Footer từ hệ thống CMS Backend
  try {
    const data = await ContentService.getConfig('FOOTER_DATA');
    if (data && Object.keys(data).length > 0) {
      footerLinks = {
        about: data.about || footerLinks.about,
        support: data.support || footerLinks.support,
        policy: data.policy || footerLinks.policy,
      };
    }
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Footer từ Backend:", error);
  }

  return (
    <footer className="w-full bg-white border-t border-gray-100 font-roboto pt-10">
      
      {/* 1. NEWSLETTER SECTION */}
      <div className="w-full max-w-[1340px] mx-auto px-4 lg:px-6 mb-12">
        <div className="bg-gray-50 rounded-lg p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="md:w-1/2">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng ký nhận bản tin</h3>
            <p className="text-gray-500 text-sm">Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên và cập nhật các ưu đãi mới nhất.</p>
          </div>
          <NewsletterForm sourceTag="footer" />
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="w-full max-w-[1340px] mx-auto px-4 lg:px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Cột 1: Logo & Thông tin liên hệ (Chiếm 4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="block">
              <img
                className="w-[160px] h-auto object-contain"
                src="/images/gmall-logo.png"
                alt="G-mall Logo"
              />
            </Link>
            <div className="flex flex-col gap-3 text-sm text-gray-500 leading-relaxed">
              <p>
                <span className="font-bold text-gray-900">Địa chỉ:</span> Tầng 4, Tòa nhà Flemington, 182 Lê Đại Hành, Phường 15, Quận 11, TP. Hồ Chí Minh.
              </p>
              <p>
                <span className="font-bold text-gray-900">Email:</span> support@gmall.vn
              </p>
              <p>
                <span className="font-bold text-gray-900">Hotline:</span>{" "}
                <a href="tel:19001221" className="text-brand-orange font-bold text-base hover:underline">1900 1221</a>
                <span className="text-xs ml-2 text-gray-400">(8:00 - 22:00)</span>
              </p>
            </div>
            {/* Chứng nhận */}
            <div className="flex items-center gap-4 mt-2">
                <img className="h-[32px] w-auto object-contain cursor-pointer hover:opacity-80" src="/assets/ImageAsset127.png" alt="Đã thông báo bộ công thương" />
                <img className="h-[32px] w-auto object-contain cursor-pointer hover:opacity-80" src="/assets/ImageAsset128.png" alt="DMCA Protected" />
            </div>
          </div>

          {/* Cột 2: Cột động - Về chúng tôi (Chiếm 2/12) */}
          <div className="lg:col-span-2">
            <FooterTitle>{footerLinks.about.title}</FooterTitle>
            <ul className="flex flex-col gap-2">
              {(footerLinks.about.links || []).map((link: any, idx: number) => (
                <FooterLinkItem key={`about-${idx}`} {...link} />
              ))}
            </ul>
          </div>

          {/* Cột 3: Cột động - Hỗ trợ (Chiếm 3/12) */}
          <div className="lg:col-span-3">
            <FooterTitle>{footerLinks.support.title}</FooterTitle>
            <ul className="flex flex-col gap-2">
              {(footerLinks.support.links || []).map((link: any, idx: number) => (
                <FooterLinkItem key={`support-${idx}`} {...link} />
              ))}
            </ul>
          </div>

          {/* Cột 4: Kết nối & Tải app (Chiếm 3/12) */}
          <div className="lg:col-span-3">
            <FooterTitle>KẾT NỐI VỚI CHÚNG TÔI</FooterTitle>
            <div className="flex items-center gap-3 mb-8">
               {SOCIAL_ICONS.map((icon, idx) => (
                 <a
                   key={idx}
                   href={icon.href}
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label={icon.alt}
                   className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:border-brand-orange hover:shadow-sm transition-all bg-white group"
                 >
                    <img src={icon.src} alt={icon.alt} className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                 </a>
               ))}
            </div>

            <FooterTitle>PHƯƠNG THỨC THANH TOÁN</FooterTitle>
            <div className="flex flex-wrap gap-3">
               {PAYMENT_METHODS.map((method, idx) => (
                 <div key={idx} className="bg-white border border-gray-100 rounded px-2 py-1 flex items-center justify-center h-[30px] shadow-sm">
                   <img src={method.src} alt={method.alt} style={{ width: method.width }} className="max-h-full object-contain" />
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. COPYRIGHT BOTTOM BAR */}
      <div className="bg-[#F8F9FA] border-t border-gray-200 py-6">
         <div className="w-full max-w-[1340px] mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    {/* Wiki 0104: năm cứng "2024" đứng nguyên tới 2026 — footer là chỗ
                        khách nhìn để đoán site còn sống hay bỏ hoang. Lấy năm hiện tại
                        (Footer là server component nên không lệch hydrate). */}
                    <p className="text-[12px] text-gray-500 font-medium mb-1">© {new Date().getFullYear()} - Bản quyền thuộc về Công ty Cổ phần G-mall Việt Nam</p>
                    <p className="text-[10px] text-gray-400">
                        Giấy CNĐKDN: 0101234567 do Sở KH & ĐT TP.HCM cấp lần đầu ngày 01/01/2024
                    </p>
                </div>
                <div className="flex items-center gap-6 text-[12px] text-gray-500">
                    <span>Quốc gia: Việt Nam</span>
                    <span className="w-px h-3 bg-gray-300"></span>
                    <span>Ngôn ngữ: Tiếng Việt</span>
                </div>
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
// src/modules/home/data/heroData.ts
//
// Wiki 0104: bộ này là DỰ PHÒNG, chỉ hiện khi admin CHƯA cấu hình banner nào ở CMS
// (`location=HOMEPAGE`). Đường đi chính là banner thật của khách — xem `homeClient.tsx`.
//
// Bản cũ có 5 slide nhưng chỉ 3 ảnh: slide 4 và 5 là bản sao y của 1 và 2, comment ghi
// thẳng "Lặp lại ảnh 1 để test loop" — giàn giáo lúc dựng khung bị đẩy ra production,
// nên khách xem trang chủ thấy cùng một banner lặp lại hai lần trong một vòng quay.
// Nội dung cũng gắn cứng "2024" và trỏ về các danh mục `thoi-trang` / `cong-nghe`
// KHÔNG tồn tại trong danh mục thật (danh mục thật: quà tặng, mẹ và bé, làm đẹp...).
// Đã bỏ bản sao, gỡ mốc năm, và trỏ CTA về những trang chắc chắn có thật.

export const HERO_SLIDES = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600",
    alt: "Quà tặng trao gửi yêu thương",
    title: "Quà Tặng Trao Yêu Thương",
    description: "Gợi ý quà theo từng dịp, gói quà tận tâm, giao nhanh toàn quốc.",
    ctaLabel: "Khám Phá Quà Tặng",
    ctaLink: "/search",
    theme: "dark",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1600",
    alt: "Hàng chính hãng chọn lọc",
    title: "Chính Hãng, Chọn Lọc",
    description: "Sản phẩm từ các gian hàng đã được kiểm duyệt, đổi trả minh bạch.",
    ctaLabel: "Xem Sản Phẩm",
    ctaLink: "/search",
    theme: "light",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600",
    alt: "Ưu đãi giới hạn trong ngày",
    title: "Ưu Đãi Mỗi Ngày",
    description: "Săn khung giờ vàng cùng hàng ngàn voucher đang chờ bạn.",
    ctaLabel: "Săn Deal Ngay",
    ctaLink: "/flash-sale",
    theme: "dark",
  },
];

// Wiki 0104: dải ô nhỏ dưới hero. Đây là ô TRANG TRÍ — `SubHeroCarousel` không nhận
// `href` nên bấm vào không đi đâu cả.
//
// Đã gỡ ô "Trang Sức" bị LẶP LẠI ở cuối (5 ô nhưng chỉ 4 ảnh khác nhau, người xem
// thấy cùng một ô hiện hai lần trong một vòng).
//
// CỐ Ý KHÔNG đổi nhãn sang tên danh mục thật ("Dành cho Mẹ và Bé", "Điện Hoa Thiệp
// mừng"...): ảnh ở đây vẫn là ảnh kho Unsplash, đổi nhãn mà giữ ảnh cũ sẽ thành
// "ảnh trang sức, nhãn Mẹ & Bé" — sai lệch hơn hiện trạng. Việc cần khách làm là
// cấp ảnh danh mục thật; khi có ảnh thì đổi cả cụm ảnh + nhãn + link một lượt.
export const SUB_HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600",
    alt: "Trang sức cao cấp",
    label: "Trang Sức",
  },
  {
    // Đổi sang ảnh khác — photo-1617220828111-eb241202a929 bị Chrome ORB block
    // (Unsplash CDN không trả CORP header cho ảnh đó), gây broken image trên FE.
    src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600",
    alt: "Mỹ phẩm chính hãng",
    label: "Mỹ Phẩm",
  },
  {
    src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
    alt: "Túi xách thời thượng",
    label: "Túi Xách",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    alt: "Giày hiệu năng động",
    label: "Giày Dép",
  },
];

export const SIDEBAR_IMAGES = {
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200", 
  promoBg: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600", 
};
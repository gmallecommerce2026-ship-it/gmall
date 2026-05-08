// Hàm reverse: từ tag slug → tên hiển thị tiếng Việt cho user.
// Áp dụng cho breadcrumb / page title (#28, #44 trong feedback).
//
// Cấu trúc tag tiêu chuẩn của project: <namespace>_<id>_<param>_<label>
//   occasion_14_2_valentine  → "Valentine"
//   recipient_mom            → "Quà tặng Mẹ"
//   bestseller               → "Bán chạy"
//
// Mapping cứng cho các tag phổ biến — nhanh hơn fetch BE; với tag mới
// fallback dùng heuristic tách dấu gạch + capitalize.
const TAG_LABELS: Record<string, string> = {
  bestseller: 'Bán chạy',
  newest: 'Mới nhất',
  handmade: 'Quà handmade',
  premium: 'Quà cao cấp',
  flash_sale: 'Flash Sale',
  trending: 'Xu hướng',
  recommended: 'Gợi ý hôm nay',
  // Occasions
  occasion_8_3: 'Quốc tế Phụ nữ 8/3',
  occasion_14_2_valentine: 'Valentine 14/2',
  occasion_20_10: 'Phụ nữ Việt Nam 20/10',
  occasion_20_11: 'Nhà giáo 20/11',
  occasion_birthday: 'Sinh nhật',
  occasion_christmas: 'Giáng sinh',
  occasion_tet: 'Tết Nguyên Đán',
  // Recipients
  recipient_mom: 'Quà tặng Mẹ',
  recipient_dad: 'Quà tặng Bố',
  recipient_couple: 'Quà tặng người yêu',
  recipient_friend: 'Quà tặng bạn bè',
  recipient_colleague: 'Quà tặng đồng nghiệp',
  recipient_kid: 'Quà tặng trẻ em',
};

export const humanizeTag = (raw: string | null | undefined): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (TAG_LABELS[trimmed]) return TAG_LABELS[trimmed];

  // Fallback heuristic: tách `_` và `-`, bỏ id-segment thuần số/short, capitalize.
  // Ví dụ: "occasion_14_2_valentine" → tags=["occasion","14","2","valentine"]
  // → bỏ "occasion" (namespace prefix) + chữ thuần số → "Valentine"
  const namespacePrefixes = new Set(['occasion', 'recipient', 'event', 'tag', 'category']);
  const tokens = trimmed
    .split(/[_-]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const meaningful = tokens.filter((t, i) => {
    if (i === 0 && namespacePrefixes.has(t.toLowerCase())) return false;
    if (/^\d+$/.test(t) && t.length <= 2) return false; // bỏ id 1-2 ký tự số
    return true;
  });
  if (meaningful.length === 0) return trimmed;
  return meaningful
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(' ');
};

// Hàm trích xuất tag từ URL hoặc tạo slug nếu không có URL
// Input: "/search?tag=qua-tang-me" -> Output: "qua-tang-me"
export const extractTagFromLink = (link: string, name: string): string => {
  try {
    // 1. Nếu link có chứa tham số tag
    if (link && link.includes('tag=')) {
        const urlObj = new URL(link, 'http://dummy.com'); // Hack base url để parse
        const tag = urlObj.searchParams.get('tag');
        if (tag) return tag;
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Fallback: Nếu không có link chuẩn, tự tạo slug từ tên hiển thị
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
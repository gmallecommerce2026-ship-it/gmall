// URL-safe base64: thay + -> -, / -> _, bỏ = padding.
// Base64 chuẩn có '+' và '/' — URLSearchParams spec coi '+' là space ->
// searchParams.get() trả sai giá trị, decode fail. URL-safe tránh vấn đề này
// mà không cần encodeURIComponent/decodeURIComponent tường minh ở call site.
export const encodeData = (data: any): string => {
  try {
    return Buffer.from(JSON.stringify(data))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error("Encode error", e);
    return "";
  }
};

export const decodeData = (str: string | null): any => {
  if (!str) return null;
  try {
    // Restore base64 chuẩn trước khi decode.
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad lại '=' cho đủ bội số 4.
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
  } catch (e) {
    console.error("Decode error", e);
    return null;
  }
};

export const getSearchUrl = (params: { 
  keyword?: string; 
  category?: string; // Slug của danh mục
  tag?: string;      // Tag hệ thống (ví dụ: recipient:pregnant)
  sort?: string 
}) => {
  const searchParams = new URLSearchParams();

  // 1. Map keyword
  if (params.keyword) searchParams.set('q', params.keyword);
  
  // 2. Map Category Slug (Backend cần field này để filter)
  if (params.category) searchParams.set('categorySlug', params.category);
  
  // 3. Map Tag (Quan trọng cho tính năng Auto-Tag)
  if (params.tag) searchParams.set('tag', params.tag);

  if (params.sort) searchParams.set('sort', params.sort);

  return `/search?${searchParams.toString()}`;
};

/**
 * Chuẩn hoá đường dẫn do admin nhập trong CMS (footer, menu, banner).
 *
 * Wiki 0104. Đo dữ liệu thật trên prod (`GET /content/config/FOOTER_DATA`) thấy 3 dạng hỏng:
 *   1. `"/https://gmall.onrender.com/blog/..."` — dán URL tuyệt đối vào ô vốn dành cho
 *      đường dẫn tương đối, thành ra một đường dẫn dính liền không tồn tại (404).
 *   2. `"https://gmall.onrender.com/blog/..."` — trỏ đúng bài viết nhưng qua domain Render
 *      CŨ đã ngừng dùng; khách bấm là rời khỏi gmall.vn sang một địa chỉ chết.
 *   3. Chuỗi rỗng — Next `<Link href="">` không điều hướng đi đâu cả.
 *
 * Vì sao chuẩn hoá ở FE chứ không chỉ sửa dữ liệu một lần: ô nhập trong trang quản trị
 * vẫn là ô chữ tự do, nên lần sau admin dán URL tuyệt đối là tái diễn y hệt. Sửa dữ liệu
 * chữa hiện tại, chuẩn hoá chữa tương lai — cần cả hai.
 *
 * Link ra ngoài hệ thống được GIỮ NGUYÊN: không phải cái gì cũng là link nội bộ.
 */
const OWN_HOSTS = ['gmall.vn', 'www.gmall.vn', 'gmall.onrender.com', 'localhost'];

export function normalizeCmsHref(raw?: string | null): string {
  let h = (raw || '').trim();
  if (!h) return '/';

  // Dạng (1): gỡ dấu "/" thừa đứng trước một URL tuyệt đối
  if (/^\/https?:\/\//i.test(h)) h = h.slice(1);

  // Giữ nguyên các lược đồ không phải điều hướng trang
  if (/^(mailto:|tel:|#)/i.test(h)) return h;

  if (/^https?:\/\//i.test(h)) {
    try {
      const u = new URL(h);
      // Dạng (2): URL trỏ về chính hệ thống (kể cả domain cũ) → đổi sang đường dẫn nội bộ
      if (OWN_HOSTS.includes(u.hostname)) {
        return `${u.pathname}${u.search}${u.hash}` || '/';
      }
      return h; // link ngoài: giữ nguyên
    } catch {
      return '/'; // URL không phân tích được — thà về trang chủ còn hơn link gãy
    }
  }

  return h.startsWith('/') ? h : `/${h}`;
}

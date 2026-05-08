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
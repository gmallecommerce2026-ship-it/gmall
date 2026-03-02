export const encodeData = (data: any): string => {
  try {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  } catch (e) {
    console.error("Encode error", e);
    return "";
  }
};

export const decodeData = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(Buffer.from(str, 'base64').toString('utf-8'));
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
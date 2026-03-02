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
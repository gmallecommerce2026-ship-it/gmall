// src/modules/home/components/CategoryMenu.tsx
import React from "react";
import Link from "next/link";

// --- [HELPER] Hàm tạo slug giả lập từ tên danh mục (cho dự án thực tế nên có field slug riêng trong DB) ---
const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

// --- [COMPONENT] Hiển thị một dòng chứa nhiều sub-category ngăn cách bởi dấu "/" ---
const SubCategoryRow = ({ rawText }: { rawText: string }) => {
  // Tách chuỗi dựa trên dấu "/"
  const items = rawText.split("/").map((item) => item.trim());

  return (
    <div className="flex flex-wrap items-center gap-x-1 text-[13px] leading-snug text-gray-500">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-300 select-none">/</span>}
          <Link
            href={`/search?category=${createSlug(item)}`}
            // [FIX] Thêm 'text-gray-500' vào đây để set màu mặc định
            className="text-gray-500 hover:text-brand-orange transition-colors hover:underline"
          >
            {item}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
};

// --- [COMPONENT] Một cột danh mục lớn ---
const CategoryColumn = ({ title, links }: { title: string; links: string[] }) => {
  // Tạo link cho title chính
  const titleSlug = createSlug(title);

  return (
    <div className="flex flex-col gap-3">
      <Link href={`/category/${titleSlug}`}>
        <h3 className="font-roboto text-[14px] text-gray-900 uppercase border-b border-gray-100 pb-2 hover:text-brand-orange transition-colors inline-block">
          {title}
        </h3>
      </Link>
      
      <div className="flex flex-col gap-2">
        {links.map((rowText, index) => (
          <SubCategoryRow key={index} rawText={rowText} />
        ))}
      </div>
    </div>
  );
};

// --- [DATA] Dữ liệu mẫu chuẩn ---
const CATEGORY_DATA: Record<string, string[]> = {
  "Thời trang nữ": [
    "Áo Khoác / Áo Len & Cardigan",
    "Áo Sơ Mi / Áo Thun / Áo Kiểu",
    "Chân Váy / Đầm / Jumpsuit",
    "Quần Jeans / Quần Dài / Quần Short",
    "Đồ Ngủ / Đồ Lót / Đồ Bơi",
    "Trang Phục Bầu / Đồ Truyền Thống",
  ],
  "Đồ điện tử": [
    "Điện Thoại & Phụ Kiện",
    "Máy Tính & Laptop",
    "Máy Ảnh & Máy Quay Phim",
    "Thiết Bị Âm Thanh / Loa / Tai Nghe",
    "Thiết Bị Đeo Thông Minh",
    "Thiết Bị Game / Console",
    "Tivi & Thiết Bị Điện Gia Dụng",
  ],
  "Bách hoá online": [
    "Đồ Ăn Vặt / Bánh Kẹo",
    "Đồ Uống / Bia Rượu / Giải Khát",
    "Thực Phẩm Chế Biến Sẵn",
    "Thực Phẩm Tươi Sống / Đông Lạnh",
    "Gia Vị & Nguyên Liệu Nấu Ăn",
    "Sữa & Các Sản Phẩm Từ Sữa",
    "Đồ Hộp & Thực Phẩm Đóng Gói",
  ],
  "Sắc đẹp": [
    "Chăm Sóc Da Mặt",
    "Trang Điểm / Makeup",
    "Chăm Sóc Tóc / Dưỡng Tóc",
    "Chăm Sóc Cơ Thể / Tắm",
    "Nước Hoa",
    "Dụng Cụ Làm Đẹp / Máy Rửa Mặt",
    "Sản Phẩm Cho Nam Giới",
  ],
  "Thời trang nam": [
    "Áo Khoác / Áo Vest / Áo Thun",
    "Quần Jeans / Quần Tây / Quần Short",
    "Đồ Lót / Đồ Bơi / Đồ Thể Thao",
    "Giày Tây / Giày Thể Thao / Sandal",
  ],
  "Nhà cửa & Đời sống": [
    "Chăn Ga Gối Nệm",
    "Đồ Dùng Nhà Bếp / Phòng Ăn",
    "Đèn & Thiết Bị Chiếu Sáng",
    "Trang Trí Nhà Cửa / Decor",
    "Dụng Cụ Sửa Chữa Nhà Cửa",
  ],
  "Mẹ & Bé": [
    "Tã & Bỉm Cho Bé",
    "Sữa & Đồ Ăn Dặm",
    "Thời Trang Cho Bé Trai / Bé Gái",
    "Đồ Chơi & Học Tập",
    "Chăm Sóc Mẹ Mang Thai",
  ],
  "Thể Thao & Du Lịch": [
    "Dụng Cụ Thể Thao / Tập Gym",
    "Trang Phục Thể Thao",
    "Giày Thể Thao Chuyên Dụng",
    "Đồ Dã Ngoại & Cắm Trại",
    "Vali / Túi Du Lịch / Phụ Kiện",
  ],
};

const CategoryMenu = () => {
  const categoryKeys = Object.keys(CATEGORY_DATA);

  return (
    // [FIX] Layout Container:
    // 1. w-full: Chiếm hết chiều rộng cha (thường là dropdown background).
    // 2. max-w-[1340px] + mx-auto: Để nội dung căn giữa và bằng với Header.
    // 3. px-4 lg:px-6: Padding ngang đồng bộ với Header.
    <div className="bg-white w-full border-t border-gray-100 shadow-sm">
      <div className="w-full max-w-[1340px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
          {categoryKeys.map((key) => (
            <CategoryColumn 
              key={key} 
              title={key} 
              links={CATEGORY_DATA[key]} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
// src/modules/product-details/components/ProductInfo.tsx
"use client";

import React from "react";
import { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

/** Mô tả ngắn được lưu dạng JSON trong `shortDesc`. Phân tích một lần, dùng cho cả
 *  dòng thông tin ở đầu trang và bảng đặc điểm bên dưới. */
function parseShortDesc(raw: unknown): Record<string, string> | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : null;
  } catch {
    return null;
  }
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const sd = parseShortDesc((product as any).shortDesc);

  // Wiki 0104 (đợt 3): đầu trang hiện "Thương hiệu: No Brand" trong khi bảng ngay bên
  // dưới ghi "Thương hiệu: MUNCHKIN" — hai con số cãi nhau trên cùng một màn hình.
  // "No Brand" KHÔNG phải dữ liệu thật: `mapProductDetail` gán `brand: raw.brand ||
  // 'No Brand'` khi cột `brand` của sản phẩm để trống. Trong khi đó tên hãng thật do
  // người bán nhập vẫn nằm trong mô tả ngắn. Nên coi "No Brand" như trống và lấy tên
  // hãng ở mô tả ngắn trước khi lùi về "Chính hãng".
  const brandLabel = (() => {
    const fromField = (product.brand || "").trim();
    if (fromField && !/^no[\s-]*brand$/i.test(fromField)) return fromField;
    const fromShortDesc = (sd?.brand || "").trim();
    return fromShortDesc || "Chính hãng";
  })();

  return (
    <div className="flex flex-col gap-5">
      {/* Tiêu đề & Đánh giá */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
          {product.title}
        </h1>
        {/* Wiki 0104 (đợt 3): thêm `flex-wrap` + `whitespace-nowrap` cho từng mục.
            Trước đây hàng này là `flex` không cho xuống dòng, nên trên màn hình hẹp các
            mục bị bóp lại và chữ vỡ giữa cụm ("Đã" / "bán 0", "Thương hiệu: No" / "Brand").
            Giờ mỗi mục giữ nguyên khối và tự xuống dòng khi hết chỗ. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center text-yellow-500 whitespace-nowrap">
            <span>★★★★★</span>
            <span className="text-gray-500 ml-2">({product.rating || 5.0})</span>
          </div>
          <span className="hidden sm:block w-[1px] h-4 bg-gray-300"></span>
          <span className="text-gray-500 whitespace-nowrap">Đã bán {product.salesCount || 0}</span>
          <span className="hidden sm:block w-[1px] h-4 bg-gray-300"></span>
          <span className="text-gray-500 font-medium">Thương hiệu: {brandLabel}</span>
        </div>
      </div>

      {/* Mô tả ngắn / Đặc điểm nổi bật */}
      <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/80 flex flex-col gap-3">
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
          Mô tả ngắn & Đặc điểm
        </h3>
        {(() => {
          // Wiki 0094 (spec 0018): mô tả ngắn gồm 6 mục — Thương hiệu / Đặc điểm nổi bật /
          // Lợi ích / Phù hợp tặng cho / Dịp tặng / Ghi chú. Seller nhập đủ 6 ở trang thêm SP,
          // nhưng bản trước chỉ render `sd.brand || sd.note` → 4/6 mục KHÔNG BAO GIỜ hiện.
          // (Bản trước nữa còn đọc sai tên trường: `shortDescription` trong khi DB lưu `shortDesc`
          //  → luôn rơi về cắt mô tả dài.)
          // Wiki 0104 (đợt 3): `sd` nay được phân tích một lần ở đầu component vì dòng
          // thông tin đầu trang cũng cần tên thương hiệu trong đó.
          const ROWS = [
            { key: "brand", label: "Thương hiệu" },
            { key: "features", label: "Đặc điểm nổi bật" },
            { key: "benefits", label: "Lợi ích" },
            { key: "recipient", label: "Phù hợp tặng cho" },
            { key: "occasion", label: "Dịp tặng" },
            { key: "note", label: "Ghi chú" },
          ];

          const filled = sd
            ? ROWS.filter((r) => typeof sd?.[r.key] === "string" && sd[r.key].trim() !== "")
            : [];

          if (filled.length > 0) {
            return (
              // Wiki 0104 (đợt 3) — bảng này TRƯỚC ĐÂY vỡ layout: nhãn chồng lên nhãn
              // ("MUNCHKI" + "Đặc điểm nổi bật" đè nhau) và đoạn mô tả dài xuống dòng
              // từng chữ rồi tràn ra khỏi thẻ. Ba nguyên nhân cộng lại:
              //
              //   1. THIẾU `min-w-0`. Ô của CSS grid mặc định không co nhỏ hơn chiều rộng
              //      nội dung tối thiểu, nên nội dung dài không xuống dòng mà **đẩy tràn
              //      ra ngoài ô** — chính là chỗ chữ đè lên cột bên cạnh.
              //   2. `dt` có `shrink-0` với nhãn dài ("Đặc điểm nổi bật:") chiếm gần hết
              //      nửa cột, `dd` không có `flex-1` nên chỉ còn một dải hẹp ⇒ mỗi dòng
              //      một chữ.
              //   3. Đoạn văn dài bị nhồi vào **nửa** chiều rộng: các mục "Đặc điểm nổi
              //      bật"/"Lợi ích" là cả đoạn, không phải giá trị ngắn như "Dịp tặng".
              //
              // Cách sửa: giữ 2 cột cho giá trị NGẮN (đỡ trống trải), nhưng mục nào dài
              // thì cho chiếm cả hàng; cộng `min-w-0` + `flex-1` + `break-words` để chữ
              // luôn xuống dòng bên trong ô thay vì tràn ra.
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {filled.map((r) => {
                  const value = sd?.[r.key] ?? "";
                  const isLong = value.length > 60;
                  return (
                    <div
                      key={r.key}
                      className={`flex min-w-0 gap-x-2 text-sm leading-relaxed ${
                        // Giá trị dài: trên màn hình hẹp cho nhãn nằm TRÊN để đoạn văn
                        // được dùng cả chiều rộng. Đo ở 390px: nếu vẫn kề nhau thì nhãn
                        // "Đặc điểm nổi bật:" ăn ~120px của 267px, đoạn 300 ký tự chỉ còn
                        // 140px ⇒ cột chữ cao 387px, mỗi dòng 2–3 từ. Xếp dọc thì đoạn văn
                        // được trọn 267px. Từ `sm` trở lên quay lại kề nhau và chiếm cả hàng.
                        isLong ? "flex-col sm:flex-row sm:col-span-2" : ""
                      }`}
                    >
                      <dt className="shrink-0 text-gray-500">{r.label}:</dt>
                      <dd className="min-w-0 flex-1 whitespace-pre-line break-words font-medium text-gray-800">
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            );
          }

          // Chưa nhập mô tả ngắn → rút gọn từ mô tả dài (strip HTML), giữ hành vi cũ.
          const fallback = product.description
            ? String(product.description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
            : "";
          return (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {fallback || "Thông tin mô tả chi tiết sản phẩm đang được cập nhật."}
            </p>
          );
        })()}
      </div>
    </div>
  );
};

export default ProductInfo;
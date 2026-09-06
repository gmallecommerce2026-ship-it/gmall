// src/app/(main)/shop/shopClient.tsx
"use client";

// wiki 0108: trang này TRƯỚC ĐÂY là một bản dựng tĩnh hoàn toàn — "abc shop",
// "Sản phẩm: 2,4K", "Người theo dõi: 2,4K", 5 tab giả, không một lời gọi API nào.
// Nó không nằm trong khu vực nội bộ mà **công khai trên gmall.vn**, và header
// (`NavDropdown` → "Cửa hàng") lẫn `BlogHeader` đều trỏ tới. Nghĩa là khách bấm
// "Cửa hàng" thì rơi vào một trang bịa.
//
// Nay dựng lại thành danh bạ gian hàng thật, đọc `GET /shops` (BE đã lọc
// `status: 'ACTIVE'` nên shop chờ duyệt không lọt ra ngoài).

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Store } from "lucide-react";
import { ShopService } from "@/services/shop.service";

interface ShopCard {
  id: string;
  slug?: string;
  name: string;
  avatarUrl: string;
  productCount: number | null;
  rating: number | null;
}

const PAGE_SIZE = 24;

const ShopClient = () => {
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await ShopService.getShops({ page, limit: PAGE_SIZE, search: term });
    setShops(res.shops);
    setTotal(res.total);
    setTotalPages(res.totalPages);
    setLoading(false);
  }, [page, term]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setTerm(search.trim());
  };

  return (
    <div className="w-full max-w-[1438px] mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Gian hàng trên GMall</h1>
        <p className="text-sm text-gray-500">
          {loading ? "Đang tải danh sách gian hàng…" : `${total.toLocaleString("vi-VN")} gian hàng đang hoạt động`}
        </p>
      </div>

      <form onSubmit={onSearch} className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm gian hàng theo tên…"
            aria-label="Tìm gian hàng theo tên"
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
          />
        </div>
        <button
          type="submit"
          className="h-11 px-6 rounded-lg bg-brand-orange text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Tìm
        </button>
      </form>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Store size={48} className="text-gray-300" />
          <p className="text-gray-500">
            {term ? `Không tìm thấy gian hàng nào khớp với “${term}”.` : "Chưa có gian hàng nào đang hoạt động."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/shop/${shop.slug || shop.id}`}
              className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-3 hover:border-brand-orange hover:shadow-md transition-all"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={shop.avatarUrl}
                  alt={shop.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <p className="text-sm font-medium text-gray-800 text-center line-clamp-2">{shop.name}</p>
              {shop.productCount !== null && (
                <p className="text-xs text-gray-400">{shop.productCount} sản phẩm</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-9 px-4 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-brand-orange transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-9 px-4 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-brand-orange transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopClient;

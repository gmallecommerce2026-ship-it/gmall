"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiStar,
  FiAlertCircle,
  FiRefreshCw,
  FiDollarSign,
  FiShoppingBag,
} from "react-icons/fi";
import { AdminService } from "@/services/AdminService";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  BANNED: "bg-red-100 text-red-700",
  REJECTED: "bg-gray-100 text-gray-700",
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

type Tab = 'overview' | 'products' | 'documents';

export default function AdminSellerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Wiki 0063: thêm tabs theo audit Admin #8 "tab khác mất". 3 tabs đơn giản:
  // tổng quan / sản phẩm / giấy tờ.
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await AdminService.getSellerDetail(params.id);
        if (!cancelled) setShop(res);
      } catch (e: any) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message || e?.message || "Không tải được chi tiết shop";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-500">
        <FiRefreshCw className="animate-spin mb-3 text-blue-500" size={32} />
        <p>Đang tải thông tin shop...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-red-500">
        <FiAlertCircle size={32} className="mb-3" />
        <p>{error || "Không tìm thấy shop"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const statusCls = STATUS_COLORS[shop.status] || "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={16} /> Quay lại danh sách người bán
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls}`}>
          {shop.isBanned ? "BANNED" : shop.status}
        </span>
      </div>

      <header className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start">
        <img
          src={shop.avatar || shop.owner?.avatar || "/placeholder.png"}
          alt={shop.name}
          className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-200"
        />
        <div className="flex-1 min-w-0 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
          <p className="text-sm text-gray-500">slug: {shop.slug}</p>
          {shop.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{shop.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
            <span className="flex items-center gap-1">
              <FiStar className="text-amber-500" /> {Number(shop.rating || 0).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <FiPackage /> {shop.productCount} SP
            </span>
            <span>Tham gia: {formatDate(shop.createdAt)}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat icon={<FiDollarSign />} label="Tổng doanh thu (DELIVERED)" value={formatCurrency(shop.totalRevenue)} />
        <Stat icon={<FiShoppingBag />} label="Đơn hàng đã giao" value={String(shop.totalOrders)} />
        <Stat icon={<FiPackage />} label="Số sản phẩm" value={String(shop.productCount)} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'overview' as Tab, label: 'Tổng quan' },
            { id: 'products' as Tab, label: `Sản phẩm (${shop.productCount || 0})` },
            { id: 'documents' as Tab, label: 'Giấy tờ' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'documents' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Giấy phép kinh doanh & chứng nhận</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'GPKD (mặt trước)', src: shop.businessLicenseFront },
                { label: 'GPKD (mặt sau)', src: shop.businessLicenseBack },
                { label: 'Giấy phép bán hàng', src: shop.salesLicense },
                { label: 'CN Thương hiệu', src: shop.trademarkCert },
                { label: 'CN Phân phối', src: shop.distributorCert },
              ].filter(d => d.src).map(d => (
                <a key={d.label} href={d.src} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={d.src} alt={d.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-600 text-center">{d.label}</p>
                </a>
              ))}
              {![shop.businessLicenseFront, shop.businessLicenseBack, shop.salesLicense, shop.trademarkCert, shop.distributorCert].some(Boolean) && (
                <p className="col-span-full text-center text-sm text-gray-500 py-8">Shop chưa upload giấy tờ.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="divide-y divide-gray-100">
            {shop.recentProducts?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Shop chưa có sản phẩm.</div>
            ) : (
              (shop.recentProducts || []).map((p: any) => {
                const img = typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url || '/placeholder.png';
                return (
                  <Link key={p.id} href={`/product-details/${p.id}`} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <img src={img} alt={p.name} className="w-14 h-14 rounded-md object-cover bg-gray-100 border border-gray-100" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Tạo: {formatDate(p.createdAt)} · Trạng thái: {p.status}</p>
                    </div>
                    <div className="text-right whitespace-nowrap font-semibold text-gray-900">{formatCurrency(Number(p.price))}</div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${activeTab !== 'overview' ? 'hidden' : ''}`}>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <header className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Sản phẩm gần đây</h2>
          </header>
          {shop.recentProducts?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Shop chưa có sản phẩm.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(shop.recentProducts || []).map((p: any) => {
                const img =
                  typeof p.images?.[0] === "string"
                    ? p.images[0]
                    : p.images?.[0]?.url || "/placeholder.png";
                return (
                  <Link
                    key={p.id}
                    href={`/product-details/${p.id}`}
                    className="flex gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={img}
                      alt={p.name}
                      className="w-14 h-14 rounded-md object-cover bg-gray-100 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tạo: {formatDate(p.createdAt)} · Trạng thái: {p.status}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap font-semibold text-gray-900">
                      {formatCurrency(Number(p.price))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiUser className="text-gray-500" /> Chủ cửa hàng
          </h2>
          <div className="text-sm space-y-1.5 text-gray-700">
            <div className="font-medium text-gray-900">{shop.owner?.name || "—"}</div>
            {shop.owner?.email && (
              <div className="flex items-center gap-2">
                <FiMail size={14} className="text-gray-400" />
                <span className="break-words">{shop.owner.email}</span>
              </div>
            )}
            {shop.owner?.phone && (
              <div className="flex items-center gap-2">
                <FiPhone size={14} className="text-gray-400" />
                <span>{shop.owner.phone}</span>
              </div>
            )}
            {shop.pickupAddress && (
              <div className="flex items-start gap-2">
                <FiMapPin size={14} className="text-gray-400 mt-0.5" />
                <span className="break-words">{shop.pickupAddress}</span>
              </div>
            )}
            <div className="pt-2 text-xs text-gray-500">
              Verified: {shop.owner?.isVerified ? "✓" : "✗"}
              {shop.owner?.isBanned ? " · Owner BANNED" : ""}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

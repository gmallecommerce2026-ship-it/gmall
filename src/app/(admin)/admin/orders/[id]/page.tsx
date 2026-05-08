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
  FiTag,
  FiCalendar,
  FiCreditCard,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { AdminService } from "@/services/AdminService";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Chờ xử lý", cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  SHIPPING: { label: "Đang giao", cls: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Hoàn thành", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
  RETURNED: { label: "Trả hàng", cls: "bg-gray-100 text-gray-700" },
};

const formatDate = (s: string) =>
  new Date(s).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await AdminService.getOrderDetail(params.id);
        if (!cancelled) setOrder(res);
      } catch (e: any) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message || e?.message || "Không thể tải chi tiết đơn hàng";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-500">
        <FiRefreshCw className="animate-spin mb-3 text-blue-500" size={32} />
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-red-500">
        <FiAlertCircle size={32} className="mb-3" />
        <p>{error || "Không tìm thấy đơn hàng"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status] || { label: order.status, cls: "bg-gray-100 text-gray-600" };
  const itemSubtotal = (order.items || []).reduce(
    (sum: number, it: any) => sum + Number(it.price || 0) * (it.quantity || 1),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={16} /> Quay lại danh sách đơn
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Đơn hàng #{order.id.split("-")[0].toUpperCase()}
        </h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          <FiCalendar size={14} /> Tạo lúc {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <header className="p-4 border-b border-gray-100 flex items-center gap-2">
              <FiPackage className="text-gray-500" />
              <h2 className="font-semibold text-gray-800">Sản phẩm trong đơn</h2>
            </header>
            <div className="divide-y divide-gray-100">
              {(order.items || []).map((it: any) => (
                <div key={it.id} className="p-4 flex gap-4">
                  <img
                    src={
                      (typeof it.product?.images?.[0] === "string"
                        ? it.product.images[0]
                        : it.product?.images?.[0]?.url) || "/placeholder.png"
                    }
                    alt={it.product?.name || ""}
                    className="w-16 h-16 object-cover rounded border border-gray-100 bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product-details/${it.product?.id || it.productId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                    >
                      {it.product?.name || it.name || "Sản phẩm"}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">SL: {it.quantity}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(Number(it.price) * (it.quantity || 1))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(Number(it.price))} / SP
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="p-4 border-t border-gray-100 bg-gray-50 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="text-gray-900">{formatCurrency(itemSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-gray-900">{formatCurrency(Number(order.shippingFee || 0))}</span>
              </div>
              {order.voucher && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Voucher ({order.voucher.code})</span>
                  <span className="text-green-600">
                    -{formatCurrency(Number(order.discountAmount || 0))}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                <span>Tổng tiền</span>
                <span className="text-lg text-blue-600">
                  {formatCurrency(Number(order.totalAmount || 0))}
                </span>
              </div>
            </footer>
          </div>

          {order.message && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
              <strong>Ghi chú khách hàng:</strong> {order.message}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiUser className="text-gray-500" /> Khách hàng
            </h2>
            <div className="text-sm space-y-1.5 text-gray-700">
              <div className="font-medium text-gray-900">
                {order.recipientName || order.user?.name || "Khách vãng lai"}
              </div>
              {order.user?.email && (
                <div className="flex items-center gap-2">
                  <FiMail size={14} className="text-gray-400" />
                  <span>{order.user.email}</span>
                </div>
              )}
              {(order.recipientPhone || order.user?.phone) && (
                <div className="flex items-center gap-2">
                  <FiPhone size={14} className="text-gray-400" />
                  <span>{order.recipientPhone || order.user.phone}</span>
                </div>
              )}
              {order.recipientAddress && (
                <div className="flex items-start gap-2">
                  <FiMapPin size={14} className="text-gray-400 mt-0.5" />
                  <span className="break-words">{order.recipientAddress}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiCreditCard className="text-gray-500" /> Thanh toán
            </h2>
            <div className="text-sm space-y-1.5 text-gray-700">
              <div>
                Phương thức: <strong>{order.paymentMethod || "—"}</strong>
              </div>
              <div>
                Trạng thái:{" "}
                <strong>{order.paymentStatus || "—"}</strong>
              </div>
              {order.shippingOrderCode && (
                <div>
                  Mã vận đơn: <code className="bg-gray-100 px-1 rounded">{order.shippingOrderCode}</code>
                </div>
              )}
            </div>
          </div>

          {order.shop && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FiTag className="text-gray-500" /> Cửa hàng
              </h2>
              <Link
                href={`/admin/users/sellers`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {order.shop.name}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

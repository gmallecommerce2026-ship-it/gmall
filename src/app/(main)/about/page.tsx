// Wiki 0043: trang Về chúng tôi (theo brief sitemap mục 4.1).
// Static content — không cần fetch BE. Server Component để SEO friendly.
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi — GMall",
  description:
    "GMall là nền tảng thương mại điện tử chuyên về quà tặng, kết hợp cộng đồng và quỹ từ thiện. Mua sắm — Tặng quà — Đóng góp.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
        Về GMall
      </h1>

      <div className="prose prose-orange max-w-none text-gray-700 space-y-4">
        <p className="text-lg leading-relaxed">
          GMall là nền tảng thương mại điện tử Việt Nam, tập trung vào{" "}
          <strong className="text-brand-orange">trải nghiệm tặng quà</strong>{" "}
          và <strong className="text-brand-orange">cộng đồng từ thiện</strong>.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">Sứ mệnh</h2>
        <p>
          Kết nối người mua, người bán và quỹ từ thiện trên cùng một nền tảng — biến
          mỗi đơn hàng thành một hành động ý nghĩa cho cộng đồng.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">Tính năng nổi bật</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Catalog đa danh mục: thời trang, điện tử, quà tặng, sách, mỹ phẩm…</li>
          <li>Quỹ từ thiện tích hợp ngay trong checkout — chia sẻ giá trị đơn hàng</li>
          <li>Hệ thống điểm thưởng + giới thiệu bạn bè</li>
          <li>AI tư vấn quà tặng theo mối quan hệ, dịp lễ, ngân sách</li>
          <li>Dashboard riêng cho Seller và Admin</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">Liên hệ</h2>
        <p>
          Hotline: <strong>19001221</strong>
          <br />
          Email:{" "}
          <a
            href="mailto:support@gmall.com.vn"
            className="text-brand-orange hover:underline"
          >
            support@gmall.com.vn
          </a>
          <br />
          Trang liên hệ chi tiết:{" "}
          <Link href="/contact" className="text-brand-orange hover:underline">
            /contact
          </Link>
        </p>
      </div>

      <div className="mt-10 flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Về trang chủ
        </Link>
        <Link
          href="/product"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  );
}

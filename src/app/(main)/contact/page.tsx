// Wiki 0043: trang Liên hệ (theo brief sitemap mục 4.1).
// Static — không gửi form qua BE (chưa có endpoint contact riêng). User có thể click
// Hotline / email / FB / Zalo trực tiếp. Sau này có thể thêm form gửi đến /complaints.
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ — GMall",
  description: "Hotline 19001221 — Email support@gmall.com.vn. Liên hệ với GMall qua hotline, email hoặc tạo khiếu nại trực tiếp.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Liên hệ với GMall
      </h1>
      <p className="text-gray-500 mb-10">
        Đội hỗ trợ trả lời trong 24h cho mọi yêu cầu trong giờ làm việc.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="text-brand-orange text-4xl mb-2">📞</div>
          <h3 className="font-semibold text-lg mb-1">Hotline</h3>
          <a
            href="tel:19001221"
            className="text-brand-orange text-xl font-bold hover:underline"
          >
            1900 1221
          </a>
          <p className="text-sm text-gray-500 mt-2">8h–22h cả ngày, Thứ 2 – Chủ nhật</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="text-brand-orange text-4xl mb-2">✉️</div>
          <h3 className="font-semibold text-lg mb-1">Email</h3>
          <a
            href="mailto:support@gmall.com.vn"
            className="text-brand-orange font-medium hover:underline"
          >
            support@gmall.com.vn
          </a>
          <p className="text-sm text-gray-500 mt-2">Phản hồi trong 24h</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="text-brand-orange text-4xl mb-2">💬</div>
          <h3 className="font-semibold text-lg mb-1">Chat trực tiếp</h3>
          <p className="text-sm text-gray-700">
            Click icon "Chat & Tư Vấn 24/7" góc dưới phải mọi trang để chat với
            bộ phận hỗ trợ hoặc seller.
          </p>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="text-brand-orange text-4xl mb-2">📝</div>
          <h3 className="font-semibold text-lg mb-1">Khiếu nại / Góp ý</h3>
          <Link
            href="/user/help"
            className="text-brand-orange font-medium hover:underline"
          >
            Tạo phiếu khiếu nại →
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Theo dõi trạng thái xử lý trong tài khoản
          </p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-2">Trở thành đối tác</h3>
        <p className="text-gray-700 mb-3">
          Bạn muốn bán hàng trên GMall? Đăng ký Seller miễn phí — không phí
          niêm yết.
        </p>
        <Link
          href="/seller/login"
          className="inline-block px-5 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          Đăng ký Seller
        </Link>
      </div>
    </div>
  );
}
